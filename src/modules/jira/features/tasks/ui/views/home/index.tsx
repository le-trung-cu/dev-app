"use client";
import { Loader } from "lucide-react";
import { ChartTaskPriority } from "../../../../tasks/ui/components/chart-task-priority";
import { ChartTaskTrends } from "../../../../tasks/ui/components/chart-task-trends";
import { UpcomingTasks } from "../../../../tasks/ui/components/upcoming-tasks";
import { StatsCard } from "./stat-card";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { useGetProjectAnalytics } from "../../../api/use-get-project-analytics";
import { useProjectId } from "../../../../projects/hooks/use-project-id";
import { TasksView } from "../tasks-view";
import { TasksViewSwitcher } from "../../components/tasks-view-switcher";

export const ProjectHome = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const { data, isLoading } = useGetProjectAnalytics({
    workspaceId,
    projectId,
  });

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
      </div>
      <div className="mt-10">
        <TasksViewSwitcher hiddenProjects/>
      </div>
    </div>
  );
};
