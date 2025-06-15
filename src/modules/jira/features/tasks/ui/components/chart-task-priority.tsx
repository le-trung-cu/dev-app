import {
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";

export type ChartTaskPriorityProps = {
  chartData: { name: string; value: number; color: string }[];
};

export const ChartTaskPriority = ({ chartData }: ChartTaskPriorityProps) => {
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-medium">Task Priority</CardTitle>
          <CardDescription>Task priority breakdown</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
        <div className="min-w-[350px]">
          <ChartContainer
            className=""
            config={{
              High: { color: "#ef4444" },
              Medium: { color: "#f59e0b" },
              Low: { color: "#6b7280" },
            }}
          >
            <PieChart margin={{top: 20}}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {chartData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
