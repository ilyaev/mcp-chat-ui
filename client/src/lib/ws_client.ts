import { type Dispatch } from "@reduxjs/toolkit";
import {
  addChartItem,
  addImageItem,
  addItem,
  addToolCall,
  setChatSession,
  setConnected,
  setMCPServers,
  updateLastResponse,
  type ChatSessionState,
  type ImageResponseData,
} from "@/store/slices/chatSessionSlice";

const WS_URL =
  location.protocol.indexOf("https") === 0
    ? `wss://${location.host}/client-ws`
    : `ws://${location.host.split(":")[0]}:3000/client-ws`;

export class WebSocketSessionClient {
  public model = "gemini-2.5-flash";
  public googleIdToken: string;
  public sessionId = "ws-" + Math.random().toString(36).substring(2, 15);
  public connected: boolean = false;
  public onUpdate: (() => void) | null = null;

  private url: string;
  private dispatch: Dispatch;
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  public toolCallResults = {} as {
    [s: string]: {
      type: string;
      text: string;
      items?: { type: string; text: string; data: string; mimeType: string }[];
      tool: string;
      args: string;
    };
  };
  mcpServers: string[] = [] as string[];

  constructor(googleIdToken: string, dispatch: Dispatch) {
    this.url = WS_URL;
    this.dispatch = dispatch;
    this.googleIdToken = googleIdToken;

    if (!this.ws) {
      this.initWebSocket();
    }
  }

  setState(part: Partial<ChatSessionState>) {
    this.dispatch(setChatSession(part));
  }

  initWebSocket() {
    console.log("Connecting to WebSocket server...");
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("WebSocket connection established.");
      this.connected = true;
      this.setState({
        sending: false,
        tokens: 0,
        connected: true,
      });
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
      }
      this.pingInterval = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({ type: "ping", session_id: this.sessionId })
          );
        }
      }, 15000);
    };

    this.ws.onmessage = (event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data = {} as any;
      let updated = false;

      try {
        data = JSON.parse(event.data);
      } catch {
        console.error("Error parsing WebSocket message:", event.data);
        return;
      }

      if (data.config) {
        this.processConfig(data);
      }

      if (data.delta && !data.tool) {
        this.dispatch(updateLastResponse(data.delta as string));
        updated = true;
      }

      if (data.tool) {
        if (!this.toolCallResults[data.tool.id]) {
          this.toolCallResults[data.tool.id] = {
            args: data.tool.arguments || "",
            text: "",
            tool: data.tool.name || "",
            type: "text",
          };
        }
        this.dispatch(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          addToolCall(data.tool as any)
        );
        updated = true;
      }

      if (data.toolOutput && data.id) {
        if (data.output && data.output.data) {
          data.output = [data.output];
        }
        this.toolCallResults[data.id || ""] = {
          ...(this.toolCallResults[data.id || ""] || {}),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(Array.isArray(data.output) ? { text: "" } : (data.output as any)),
          items: Array.isArray(data.output)
            ? data.output.map((item: ImageResponseData) => ({
                type: item.type || "text",
                text: item.text || "",
                data: item.data || "",
                mimeType: item.mimeType || "text/plain",
              }))
            : [],
          tool: data.toolOutput,
        };
        if (data.toolOutput === "data_chart_generator") {
          this.dispatch(addChartItem(data));
          updated = true;
        }
        if (Array.isArray(data.output)) {
          data.output.forEach((item: ImageResponseData) => {
            if (item.mimeType && item.mimeType.startsWith("image/")) {
              this.dispatch(addImageItem(item));
            }
          });
        }
      }

      if (data.error) {
        console.error("WebSocket error:", data.error);
        this.dispatch(updateLastResponse(`\n\n**Error:** ${data.error}`));
        updated = true;
        this.setState({ sending: false });
      }

      if (data.state) {
        this.setState({
          tokens: parseFloat(
            ((data.contextSizeTokens as number) / 1024).toFixed(2)
          ),
        });
      }

      if (data.done) {
        this.setState({ sending: false });
      }

      if (updated) {
        this.notifyUpdate();
      }
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.dispatch(setConnected(false));
      if (this.ws) {
        this.dispatch(
          updateLastResponse("\n\n**Connection closed. History cleared.** \n")
        );
        this.notifyUpdate();
      }
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
      this.ws = null;
    };
  }

  notifyUpdate() {
    if (this.onUpdate) {
      this.onUpdate();
    }
  }

  waitForReadyState = async () => {
    if (!this.connected) {
      const waitForConnection = () =>
        new Promise<void>((resolve) => {
          const check = () => {
            if (this.connected) {
              resolve();
            } else {
              setTimeout(check, 50);
            }
          };
          check();
        });
      await waitForConnection();
    }
  };

  setMCPServers(servers: string[]) {
    this.mcpServers = servers;
  }

  async send(message: string) {
    if (!this.ws || !this.connected) {
      this.initWebSocket();
    }
    await this.waitForReadyState();

    this.dispatch(addItem({ prompt: message, response: { text: "" } }));
    this.setState({ sending: true });

    this.ws?.send(
      JSON.stringify({
        type: "start-process",
        session_id: this.sessionId,
        prompt: message,
        model: this.model,
        instructions: "",
        mcpServers: this.mcpServers,
        id_token: this.googleIdToken || "",
      })
    );

    this.notifyUpdate();
  }

  processConfig(data: { config: { mcpServers: { [key: string]: string } } }) {
    this.dispatch(
      setMCPServers(
        Object.keys(data.config.mcpServers || {}).map((key) => {
          return {
            id: key,
            title: data.config.mcpServers[key],
          };
        })
      )
    );
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
      this.setState({ connected: false, sending: false });
    }
  }

  destroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.disconnect();
  }
}
