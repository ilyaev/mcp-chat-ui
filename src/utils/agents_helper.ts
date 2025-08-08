import {
  Agent,
  AgentInputItem,
  MCPServerStreamableHttp,
  Runner,
  RunResult,
  setTracingDisabled,
  UserMessageItem,
} from "@openai/agents";
import { GoogleGenerativeAI } from "@google/generative-ai";

setTracingDisabled(true);

const runner = new Runner({
  tracingDisabled: false,
  traceId: "ai-agent",
});

export class AgentsHelper {
  static lastResponse?: RunResult<undefined, any>;

  static getResponseImages(): { data: string; mimeType: string }[] {
    if (!this.lastResponse) {
      return [];
    }
    const images: { data: string; mimeType: string }[] = [];
    for (const item of this.lastResponse.state._generatedItems as any) {
      if (
        item.output &&
        item.output.length > 0 &&
        typeof item.output[0] === "object"
      ) {
        item.output.forEach((output: any) => {
          if (output.type === "image" && output.data) {
            images.push(output);
          }
        });
      }
    }
    return images;
  }

  static async stream(
    agent: Agent<unknown, any>,
    input: string | AgentInputItem[]
  ) {
    try {
      if (agent.mcpServers && agent.mcpServers.length > 0) {
        for (let mcpServer of agent.mcpServers) {
          if (mcpServer instanceof MCPServerStreamableHttp) {
            await mcpServer.connect();
          }
        }
      }

      const response = await runner.run(agent, input, {
        maxTurns: 100,
        stream: true,
      });

      return response;
    } catch (error) {
      console.error("Error occurred while streaming agent:", error);
      throw error;
    }
  }

  static async calculateTokenCount(
    model: string,
    input: string
  ): Promise<number> {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const gptModel = genAI.getGenerativeModel({ model });
      if (!gptModel) {
        console.error(`Model ${model} not found`);
        return 0;
      }
      const tokenCount = await gptModel.countTokens(input);
      console.log(`Token count for model ${model}:`, tokenCount);
      return tokenCount.totalTokens;
    } catch (error) {
      console.error("Error occurred while calculating token count:", error);
      return 0;
    }
  }

  static async run(
    agent: Agent<unknown, any>,
    input: string,
    images?: { data: string; mimeType: string }[]
  ): Promise<string> {
    try {
      if (agent.mcpServers && agent.mcpServers.length > 0) {
        for (let mcpServer of agent.mcpServers) {
          if (mcpServer instanceof MCPServerStreamableHttp) {
            await mcpServer.connect();
          }
        }
      }

      let response: RunResult<undefined, any>;

      if (images && images.length > 0) {
        const params = [] as UserMessageItem[];
        const content: UserMessageItem["content"] = [];
        for (const image of images) {
          content.push({
            type: "input_image",
            image: `data:${image.mimeType};base64,${image.data}`,
          });
        }
        content.push({
          type: "input_text",
          text: input,
        });

        const item: UserMessageItem = {
          role: "user",
          content: content,
        };

        params.push(item);

        response = await runner.run(agent, params as any);
        this.lastResponse = response;
      } else {
        response = await runner.run(agent, input, {
          maxTurns: 100,
        });
        this.lastResponse = response;
      }

      if (agent.mcpServers && agent.mcpServers.length > 0) {
        for (let mcpServer of agent.mcpServers) {
          if (mcpServer instanceof MCPServerStreamableHttp) {
            await mcpServer.close();
          }
        }
      }

      return response.finalOutput as string;
    } catch (error) {
      console.error("Error occurred while running agent:", error);
      throw error;
    }
  }
}
