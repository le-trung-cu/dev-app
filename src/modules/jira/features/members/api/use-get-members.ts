import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetMembers = ({
  workspaceId,
}: {
  workspaceId: string | number;
}) => {
  const query = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      const response = await client.api.jira.workspaces[
        ":workspaceId"
      ].members.$get({ param: { workspaceId: workspaceId as string } });
      if (!response.ok) {
        throw new Error("Failed to update workspace");
      }
      return (await response.json()).members;
    },
  });

  return query;
};
