import { ChartBarBig } from "lucide-react";
import {
  CartesianGrid,
  XAxis,
  BarChart,
  YAxis,
  Bar,
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
  ChartTooltipContent,
} from "@/components/ui/chart";

export type ChartProjectProductiveProps = {
  chartData: {
    projectId: string;
    name: string;
    completed: number;
    total: number;
  }[];
};

export const ChartProjectProductive = ({
  chartData,
}: ChartProjectProductiveProps) => {
  return (
    <Card className="lg:col-span-2 border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-medium">
            Workspace Productivity
          </CardTitle>
          <CardDescription>Task completion by project</CardDescription>
        </div>
        <ChartBarBig className="text-muted-foreground h-5 w-5" />
      </CardHeader>
      <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
        <div className="min-w-[350px]">
          <ChartContainer
            className="h-[300px]"
            config={{
              completed: { color: "#3b82f6" },
              total: { color: "red" },
            }}
          >
            <BarChart data={chartData} barGap={0} barSize={20}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="total"
                fill="#000"
                radius={[4, 4, 0, 0]}
                name="Total Tasks"
              />
              <Bar
                dataKey="completed"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="Completed Tasks"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
