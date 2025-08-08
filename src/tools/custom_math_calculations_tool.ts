import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import Mexp from "math-expression-evaluator";
import * as chrono from "chrono-node";
import moment from "moment-timezone";
import { convertAllDateTimesInText } from "../utils";

const registerCustomMathCalculationsTool = (mcpServer: McpServer) => {
  mcpServer.registerTool(
    "custom_math_calculations",
    {
      title: "Custom Math Calculations",
      description:
        "Evaluates an array of math expressions and returns an array of results. Use when you need to perform custom calculations on numbers. Expressions can be number based or date based. Use it for date calculations only if you cant do it yourself. Date format is strictly 'YYYY-MM-DDTHH:mm:ss'. For example, '2023-10-01T12:00:00'.",
      inputSchema: {
        precission: z
          .number()
          .optional()
          .describe(
            "Optional precision for the results. If provided, results will be rounded to this many decimal places. Use it if user asks for specific precision in calculations. Default is 2."
          )
          .default(2),
        expressions: z
          .array(z.string())
          .describe(
            'Array of math expressions as strings to evaluate. Should be string with numbers, operators (+, -, *, /), Also can include common math functions like sin, cos, tan, pow, root, log, ln, Mod etc. Function usage examples: sin(45), pow(2,3), root(5), 3 Mod 2, log(1000), ln(2) Useful when user asks to calculate average, sum, etc. of numbers coming from other tools or user input. Some complex valid example: "log(2) + ln(1) + pow(2,3) - 3 Mod 2 + (333+222/22+1)*2". Also expressions can be date based, like "next Friday", "last Monday", "tomorrow at 5pm", etc. In this case it will return date object in results array.'
          ),
      },
      outputSchema: {
        error: z
          .string()
          .describe(
            "Error message if evaluation fails. Show it to user if exists, instead of using results "
          ),
        results: z
          .array(z.number().or(z.string()))
          .describe(
            "Array of results for each expression, in same order as input expressions. It can contain numbers or dates if expression is date related (e.g. 'next Friday')"
          ),
      },
    },
    async (input, _extra) => {
      const { expressions } = input;
      let errorMsg = "";
      const mexp = new Mexp();
      const results = expressions.map((expr) => {
        try {
          return parseFloat(mexp.eval(expr).toFixed(input.precission || 2));
        } catch (error: any) {
          const parsed = chrono.parseDate(
            convertAllDateTimesInText(expr.replace(/\'/gi, "")),
            {
              instant: new Date(),
              timezone: moment()
                .tz(process.env.TZ_IANA || "America/Los_Angeles")
                .zoneAbbr(),
            }
          );
          const date = parsed
            ? moment(parsed)
                .tz(process.env.TZ_IANA || "America/Los_Angeles")
                .format("YYYY-MM-DD HH:mm:ss")
            : "";

          if (date) {
            return date;
          }
          console.error(`Error evaluating expression "${expr}":`, error);
          errorMsg += error.message || "Unknown error";
          return 0;
        }
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ results, error: errorMsg }),
          },
        ],
        structuredContent: { results, error: errorMsg },
      };
    }
  );
};

export default registerCustomMathCalculationsTool;
