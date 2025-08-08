import { Agent, OpenAIChatCompletionsModel } from "@openai/agents";
import chart_system_prompt from "../instructions/chart_agent_system_prompt";
import OpenAI from "openai";
import z from "zod";

export const chartOutputSchema = z
  .object({
    config: z
      .object({
        type: z.string().describe("Type of the chart (e.g., 'line', 'bar')."),
        xAxis: z
          .array(
            z.object({
              key: z.string().describe("Key for the X-axis metric."),
              name: z.string().describe("Display name for the X-axis metric."),
            })
          )
          .describe("Array of X-axis configuration objects"),
        yAxis: z.array(
          z.object({
            key: z.string().describe("Key for the Y-axis metric."),
            name: z.string().describe("Display name for the Y-axis metric."),
          })
        ),
      })
      .describe("Configuration object for the chart."),
    error: z.string().describe("Error message, if any."),
    title: z
      .string()
      .describe("Title of the chart suitable for showing in UI "),
    description: z
      .string()
      .describe(
        "Textual description of range of X axis. for example: 'Last 30 days', 'From ... To ...', 'Hours 0 to 15 today', 'July 1 2025 to July 31 2025' etc."
      ),
    chartData: z
      .array(z.array(z.unknown()))
      .describe(
        "Array of chart rows with data points, where each row is an array of values for the X-axis and Y-axis metrics."
      ),
  })
  .describe("Chart agent output schema");

const chartAgent = () => {
  const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: process.env.GEMINI_API_BASE_URL,
  });

  const modelFlash20 = new OpenAIChatCompletionsModel(
    openai,
    "gemini-2.0-flash"
  );

  return new Agent({
    model: modelFlash20,
    name: "Chart Generator",
    instructions: chart_system_prompt,
    outputType: chartOutputSchema,
  });
};

export default chartAgent;
