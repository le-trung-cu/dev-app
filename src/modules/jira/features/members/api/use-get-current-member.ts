import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCurrentMember = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const query = useQuery({
    enabled: !!workspaceId,
    queryKey: ["current-member", workspaceId],
    queryFn: async () => {
      const response = await client.api.jira.workspaces[
        ":workspaceId"
      ].members.current.$get({ param: { workspaceId } });
      if (!response.ok) {
        throw new Error("Failed to update workspace");
      }
      return (await response.json()).member;
    },
  });

  return query;
};
