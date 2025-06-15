import { TaskStatus } from "@/generated/prisma-jira-database/jira-database-client-types";
import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetTask = ({
  workspaceId,
  taskId,
}: {
  workspaceId: string | number;
  taskId?: string | number | null;
}) => {
  const query = useQuery({
    enabled: !!workspaceId && !!taskId,
    queryKey: ["task", workspaceId, taskId],
    queryFn: async () => {
      const response = await client.api.jira.workspaces[":workspaceId"].tasks[
        ":taskId"
      ].$get({
        param: {
          workspaceId: workspaceId as string,
          taskId: taskId as string,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get task");
      }
      return (await response.json()).task;
    },
  });

  return query;
};
