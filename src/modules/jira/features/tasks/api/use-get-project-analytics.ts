import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetProjectAnalytics = ({
  workspaceId,
  projectId,
}: {
  workspaceId: string | number;
  projectId: string | number;
}) => {
  const query = useQuery({
    enabled: !!workspaceId && !!projectId,
    queryKey: ["project-analytics", workspaceId, projectId],
    queryFn: async () => {
      const response = await client.api.jira.workspaces[
        ":workspaceId"
      ].projects[":projectId"].analytics.$get({
        param: {
          workspaceId: workspaceId as string,
          projectId: projectId as string,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get project's analytics");
      }

      return await response.json();
    },
  });

  return query;
};
