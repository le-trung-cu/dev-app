import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetProjects = ({
  workspaceId,
}: {
  workspaceId?: string;
}) => {
  const query = useQuery({
    enabled: !!workspaceId,
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      const response = await client.api.jira.workspaces[
        ":workspaceId"
      ].projects.$get({
        param: { workspaceId: workspaceId! },
      });

       if (!response.ok) {
        throw new Error("Failed to get projects");
      }
      return (await response.json()).projects;
    },
  });

  return query;
};
