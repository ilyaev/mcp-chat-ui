import {
  Agent,
  AgentInputItem,
  MCPServerStreamableHttp,
  OpenAIChatCompletionsModel,
} from "@openai/agents";
import OpenAI from "openai";
import { AgentsHelper } from "./agents_helper";
import SystemPrompt from "../instructions/system_prompt";
import { now } from "./index";

const TOOL_RESPONSE_PURGE_THRESHOLD = 1024 * 3;

const mcpServer = new MCPServerStreamableHttp({
  url: process.env.BACKEND_URL + "/mcp",
  name: "MCP Server",
  authProvider: {
    redirectToAuthorization: () => {
      return true;
    },
    clientMetadata: {
      scope: [],
    },
    saveCodeVerifier: () => {
      return true;
    },
    clientInformation: () => {
      return {
        client_id: "test",
        scope: [],
        metaData: {
          scope: [],
        },
      };
    },
    saveClientInformation: () => {
      return {
        id: "test",
      };
    },
    tokens: () => {
      return {
        access_token: "DEV_ACCESS_TOKEN",
        expires_in: 360000000000,
        token_type: "Bearer",
      };
    },
  },
});

export class ChatSession {
  public history: AgentInputItem[] = [];

  constructor(
    public sessionId: string = "",
    public userId: string = "",
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),

    public openai = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: process.env.GEMINI_API_BASE_URL,
    }),

    public modelFlash25 = new OpenAIChatCompletionsModel(
      openai,
      "gemini-2.5-flash"
    ),

    public aiAgent = new Agent({
      model: modelFlash25,
      name: "AI Agent",
      instructions: SystemPrompt.replace(/\%\%NOW\%\%/gi, now()),
      mcpServers: [mcpServer],
      modelSettings: {
        parallelToolCalls: false,
      },
    })
  ) {}

  update() {
    this.updatedAt = new Date();
  }

  addHistory(item: AgentInputItem) {
    this.history.push(item);
    this.update();
  }

  setHistory(history: AgentInputItem[]) {
    this.history = this.purgeContext(history);
    this.aiAgent.instructions = SystemPrompt.replace(/\%\%NOW\%\%/gi, now());
    console.log("Setting history for session", {
      sessionId: this.sessionId,
      history_size: this.getContextSize(),
    });
    this.update();
  }

  purgeContext(history: AgentInputItem[]) {
    return history.map((record) => {
      if (record.type === "function_call_result" && record.output) {
        return {
          ...record,
          id: record.id && record.id === "FAKE_ID" ? undefined : record.id,
          output: {
            ...record.output,
            text:
              ((record.output as any).text || "").length >
              TOOL_RESPONSE_PURGE_THRESHOLD
                ? "[RAW RESULT PURGED. USE DATA FROM NEXT ITEMS IN HISTORY. CALL TOOL AGAIN IF NEED RAW DATA WHICH IS NOT AVAILABLE IN NEXT HISTORY ITEMS]"
                : (record.output as any).text,
          },
        } as any;
      }
      return record;
    });
  }

  getContextSize() {
    return JSON.stringify(this.history).length;
  }

  flushHistory() {
    console.log("Flushing history for session", {
      sessionId: this.sessionId,
      history_size: this.getContextSize(),
    });
    this.history = [];
    this.update();
  }

  async startStream(prompt: string | AgentInputItem[]) {
    return await AgentsHelper.stream(this.aiAgent, prompt);
  }
}
