"use client";
import { Loader } from "lucide-react";
import { useGetWorkspaceAnalytics } from "../../../api/use-get-workspace-analytics";
import { useWorkspaceId } from "../../../hooks/use-workspace-id";
import { ChartProjectProductive } from "./chart-project-productive";
import { ChartTaskPriority } from "../../../../tasks/ui/components/chart-task-priority";
import { ChartTaskTrends } from "../../../../tasks/ui/components/chart-task-trends";
import { UpcomingTasks } from "../../../../tasks/ui/components/upcoming-tasks";
import { StatsCard } from "./stat-card";

export const WorkspaceHome = () => {
  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetWorkspaceAnalytics({ workspaceId });

  if (isLoading) {
    return (
      <div className="h-[200px] flex justify-center items-center">
        <Loader className="animate-spin" />
      </div>
    );
  }
  if (!data) {
    throw new Error("");
  }
  return (
    <div>
      <div className="flex flex-wrap gap-10 mt-10">
        <div className="w-full">
          <StatsCard data={data.stats} />
        </div>
        <div className="flex-1 min-w-[300px] max-w-2xl border rounded-md">
          <ChartTaskTrends chartData={data!.taskTrendsData} />
        </div>
        <div className="flex-1 border rounded-md">
          <ChartTaskPriority chartData={data.taskPriorityData} />
        </div>
        <div className="flex-1">
          <UpcomingTasks data={data.upcomingTasks} />
        </div>
        <div className="flex-1 border rounded-md basis-full">
          <ChartProjectProductive chartData={data.workspaceProductivityData} />
        </div>
      </div>
    </div>
  );
};
