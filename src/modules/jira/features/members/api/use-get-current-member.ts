import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCurrentMember = ({
  workspaceId,
}: {
  workspaceId: string | number;
}) => {
  const query = useQuery({
    queryKey: ["current-member", workspaceId],
    queryFn: async () => {
      const response = await client.api.jira.workspaces[
        ":workspaceId"
      ].members.current.$get({ param: { workspaceId: workspaceId as string } });
      if (!response.ok) {
        throw new Error("Failed to update workspace");
      }
      return (await response.json()).member;
    },
  });

  return query;
};
