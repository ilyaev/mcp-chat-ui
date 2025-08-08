/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from "react";
import { ChartLineMultiple } from "@/components/chart/LineChart";
import moment from "moment";
import { ChartBarMultiple } from "@/components/chart/BarChart";

const DayOfWeekWeight = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
} as any;

const DayOfWeekWeightBrief = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
} as any;

export interface ChatChartConfig {
  config: {
    type: string;
    xAxis: { key: string; name: string }[];
    yAxis: { key: string; name: string }[];
  };
  title: string;
  description: string;
  error: string;
  chartData: string[][];
}

interface ChatChartProps {
  config: ChatChartConfig;
}

export class ChatChart extends Component<ChatChartProps> {
  render() {
    const { config } = this.props;
    const chartData = config.chartData;
    const chartConfig = {} as any;

    const yAxis = config.config.yAxis.map((y) => {
      return {
        key: y.key.replace(/[^a-zA-Z0-9_]/g, ""),
        name: y.name,
      };
    });

    const yAxisKeys = yAxis.map((x) => x.key);

    yAxis.forEach((x, index) => {
      chartConfig[x.key] = {
        label: x.name,
        color: `var(--chart-${index + 1})`,
      };
    });

    const data = [] as any;
    chartData.forEach((item) => {
      const monthData = {} as any;
      monthData[config.config.xAxis[0].key] = item[0];
      for (let i = 1; i < item.length; i++) {
        monthData[yAxis[i - 1].key] = parseFloat(item[i]);
      }
      data.push(monthData);
    });

    const sortedData = data.sort(this.sortBy(config.config.xAxis[0].key));

    if (config.config.type === "bar") {
      return (
        <ChartBarMultiple
          chartData={sortedData}
          chartConfig={chartConfig}
          yAxisKeys={yAxisKeys}
          yKey={config.config.xAxis[0].key}
          title={config.title}
          description={config.description}
        />
      );
    }

    return (
      <ChartLineMultiple
        chartData={sortedData}
        chartConfig={chartConfig}
        yAxisKeys={yAxisKeys}
        yKey={config.config.xAxis[0].key}
        title={config.title}
        description={config.description}
      />
    );
  }

  sortBy(key: string) {
    return (a: any, b: any) => {
      if (key === "Date" || key === "DateHour") {
        const dateA = moment(a[key]);
        const dateB = moment(b[key]);
        if (dateA.isBefore(dateB)) return -1;
        if (dateA.isAfter(dateB)) return 1;
      }
      if (key === "DayOfWeek") {
        const dayA = DayOfWeekWeight[a[key]] || DayOfWeekWeightBrief[a[key]];
        const dayB = DayOfWeekWeight[b[key]] || DayOfWeekWeightBrief[b[key]];
        if (dayA < dayB) return -1;
        if (dayA > dayB) return 1;
      }
      if (!isNaN(a[key]) && !isNaN(b[key])) {
        if (parseFloat(a[key]) < parseFloat(b[key])) return -1;
        if (parseFloat(a[key]) > parseFloat(b[key])) return 1;
      }

      return a[key] < b[key] ? -1 : 1;
    };
  }
}
