
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
const chartConfig = {
  done: {
    label: "Done",
    color: "red",
  },
  inProgress: {
    label: "In Progress",
    color: "hsl(var(--chart-1))",
  },
  todo: {
    label: "Todo",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;
export type ChartTaskTrendsProps = {
  chartData: { name: string; done: number; inProgress: number; todo: number }[];
};

export const  ChartTaskTrends = ({ chartData }: ChartTaskTrendsProps) =>{
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Task Trends</CardTitle>
        <CardDescription>Daily task status changes</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              type="monotone"
              dataKey={"done"}
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="inProgress"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 4 }}
            />

            <Line
              type="monotone"
              dataKey="todo"
              stroke="#6b7280"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}