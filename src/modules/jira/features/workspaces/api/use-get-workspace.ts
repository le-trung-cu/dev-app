import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspace = ({
  workspaceId,
}: {
  workspaceId: number | string;
}) => {
  const query = useQuery({
    enabled: !!workspaceId,
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const response = await client.api.jira.workspaces[":workspaceId"].$get({
        param: { workspaceId: workspaceId as string },
      });
      if (!response.ok) {
        throw new Error("Failed to update workspace");
      }

      return (await response.json()).workspace;
    },
  });

  return query;
};
