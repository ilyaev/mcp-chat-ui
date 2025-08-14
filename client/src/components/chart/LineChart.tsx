import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import moment from "moment";

export const description = "A multiple line chart";

export interface ChartLineMultipleProps {
  chartData: Array<{ month: string; [key: string]: number | string }>;
  chartConfig: ChartConfig;
  description?: string;
  title?: string;
  yAxisKeys: string[];
  yKey: string;
}

export function ChartLineMultiple({
  chartData,
  chartConfig,
  description,
  title,
  yAxisKeys,
  yKey,
}: ChartLineMultipleProps) {
  return (
    <div>
      <CardHeader>
        <CardTitle>{title || "Line Chart - Multiple"}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={yKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formaterByKey(yKey)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {yAxisKeys.map((key) => {
              return (
                <Line
                  dataKey={key}
                  type="monotone"
                  stroke={`var(--color-${key})`}
                  strokeWidth={2}
                  dot={false}
                />
              );
            })}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </div>
  );
}

const formaterByKey = (key: string) => (value: string) => {
  if (key === "Date") {
    return moment(value).format("MMM DD");
  }
  if (key === "DateHour") {
    return moment(value).format("MMM DD HH:mm");
  }
  return value;
};
