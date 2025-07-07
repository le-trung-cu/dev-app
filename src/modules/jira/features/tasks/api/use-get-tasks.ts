import { TaskStatus } from "@/generated/prisma-jira-database/jira-database-client-types";
import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetTasks = ({
  workspaceId,
  projectId,
  status,
  endDate,
  assigneeId,
}: {
  workspaceId: string;
  projectId?: string | null;
  status?: TaskStatus | null;
  endDate?: string | null;
  assigneeId?: string | null;
}) => {
  const query = useQuery({
    enabled: !!workspaceId,
    queryKey: ["tasks", workspaceId, projectId, status, endDate, assigneeId],
    queryFn: async () => {
      const response = await client.api.jira.workspaces[
        ":workspaceId"
      ].tasks.$get({
        param: {
          workspaceId,
        },
        query: {
          projectId: !projectId ? undefined : projectId,
          status: !status ? undefined : status,
          endDate: !endDate ? undefined : endDate,
          assigneeId: !assigneeId ? undefined : assigneeId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get tasks");
      }
      return (await response.json()).tasks;
    },
  });

  return query;
};
