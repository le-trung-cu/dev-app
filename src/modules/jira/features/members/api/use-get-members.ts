import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetMembers = ({ workspaceId }: { workspaceId: string }) => {
  const query = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      const response = await client.api.jira.workspaces[
        ":workspaceId"
      ].members.$get({ param: { workspaceId } });
      if (!response.ok) {
        throw new Error("Failed to update workspace");
      }
      return (await response.json()).members;
    },
  });

  return query;
};
