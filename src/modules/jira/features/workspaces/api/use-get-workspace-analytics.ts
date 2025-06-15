import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaceAnalytics = ({
  workspaceId,
}: {
  workspaceId: string | number;
}) => {
  const query = useQuery({
    enabled: !!workspaceId,
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: async () => {
      const response = await client.api.jira.workspaces[
        ":workspaceId"
      ].analytics.$get({
        param: { workspaceId: workspaceId as string },
      });

      if (!response.ok) {
        throw new Error("Failed to get workspace's analytics");
      }

      return await response.json();
    },
  });

  return query;
};
