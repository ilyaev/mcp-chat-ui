import {
  Agent,
  AgentInputItem,
  MCPServerStreamableHttp,
  OpenAIChatCompletionsModel,
  MCPServer,
  tool,
} from "@openai/agents";
import OpenAI from "openai";
import { AgentsHelper } from "./agents_helper";
import SystemPrompt from "../instructions/system_prompt";
import codingAgentInstructions from "../instructions/coding_agent_instructions";
import { now } from "./index";
import { loadExternalMcpServers } from "./external_mcp";
import z from "zod";

const TOOL_RESPONSE_PURGE_THRESHOLD = 1024 * 3;

const EXTERNAL_MCP_SERVERS = loadExternalMcpServers() as {
  [s: string]: MCPServer;
};

const myMCPServer = new MCPServerStreamableHttp({
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

    public modelFlash20 = new OpenAIChatCompletionsModel(
      openai,
      "gemini-2.0-flash"
    ),

    public modelFlash25 = new OpenAIChatCompletionsModel(
      openai,
      "gemini-2.5-flash"
    ),

    public codingAgent = new Agent({
      model: modelFlash20,
      name: "Coding AI Agent",
      instructions: codingAgentInstructions,
      modelSettings: {
        toolChoice: "required",
      },
      handoffDescription:
        "Use this agent when you need to create a single HTML/JavaScript/CSS web page application based on user input. Or if you need to generate code snippets or assist with programming tasks. Or you need to demonstrate something visually and it can be done using HTML/CSS/JavaScript. Or if user need to do complex calculations and it also can be done using HTML/CSS/JavaScript.",
      tools: [
        tool({
          name: "html_page_code_preview",
          description:
            "Preview generated web page, show code and errors if any. Use this tool to preview the HTML, CSS, and JavaScript code for the web page as a single string parameter. Also include 'title' parameter with brief description of generated page.",
          parameters: z.object({
            html: z.string().describe("HTML code for the web page."),
            title: z.string().describe("Title of the web page."),
            height: z
              .number()
              .min(100)
              .max(1000)
              .describe(
                "Height of the web page based on content, given that width is fixed and 1024 pixels"
              ),
          }),
          async execute({ html, title }) {
            return {
              html,
              title,
            };
          },
        }),
      ],
    }),

    public genericAgent = new Agent({
      model: modelFlash25,
      name: "Generic AI Agent",
      instructions: SystemPrompt.replace(/\%\%NOW\%\%/gi, now()),
      mcpServers: ([myMCPServer] as MCPServer[]).concat(
        Object.keys(EXTERNAL_MCP_SERVERS).map(
          (key) => EXTERNAL_MCP_SERVERS[key] as MCPServer
        )
      ),
      handoffs: [codingAgent],
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
    this.genericAgent.instructions = SystemPrompt.replace(
      /\%\%NOW\%\%/gi,
      now()
    );
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

  async startStream(prompt: string | AgentInputItem[], mcpServers: string[]) {
    this.genericAgent.mcpServers = [myMCPServer].concat(
      mcpServers
        .map((id) => EXTERNAL_MCP_SERVERS[id] || null)
        .filter(Boolean) as any
    );
    return await AgentsHelper.stream(this.genericAgent, prompt);
  }
}
