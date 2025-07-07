import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

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

export const useGetMembersMap = ({ workspaceId }: { workspaceId: string }) => {
  const { data, ...query } = useGetMembers({ workspaceId });
  const members = useMemo(() => {
    return data?.reduce(
      (result, item) => {
        result[item.id] = item;
        return result;
      },
      {} as Record<string, (typeof data)[number]>
    );
  }, [data]);

  return { ...query, data: members };
};
