import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaces = () => {
  const query = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await client.api.jira.workspaces.$get();
      if (!response.ok) {
        throw new Error("Failed to get workspaces");
      }
      return (await response.json()).workspaces;
    },
  });

  return query;
};
