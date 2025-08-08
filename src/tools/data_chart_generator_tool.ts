import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import chartAgent, { chartOutputSchema } from "../agents/chart_agent";
import { AgentsHelper } from "../utils/agents_helper";

const registerDataChartGeneratorTool = (mcpServer: McpServer) => {
  mcpServer.registerTool(
    "data_chart_generator",
    {
      title: "Data Chart Generator",
      description:
        "A tool that generates a chart based on prompt, columns, and rows. Should pass 'cols' and 'rows' got from reporting tool, generate natural language prompt for chart generation and pass it to",
      inputSchema: {
        prompt: z.string().describe("Prompt for the chart generation"),
        cols: z.array(z.string()).describe("Column keys for the chart"),
        rows: z
          .array(z.array(z.unknown()))
          .describe("Rows of data for the chart"),
      },
      outputSchema: {
        result: chartOutputSchema,
      },
    },
    async (input: { prompt: string; cols: string[]; rows?: any }) => {
      const prompt = JSON.stringify(
        {
          prompt: input.prompt,
          cols: input.cols,
          rows: input.rows,
        },
        null,
        2
      );
      const agent = chartAgent();
      const result = await AgentsHelper.run(agent, prompt);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
        structuredContent: { result },
      };
    }
  );
};

export default registerDataChartGeneratorTool;
