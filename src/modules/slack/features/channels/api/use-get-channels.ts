import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";


export type GetChannelsResponType =  InferResponseType<
  (typeof client.api.chats.workspaces)[":workspaceId"]["channels"]["$get"],
  200
>;

export const useGetChannels = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const query = useQuery({
    enabled: !!workspaceId,
    queryKey: ["channels", workspaceId],
    queryFn: async () => {
      const response = await client.api.chats.workspaces[
        ":workspaceId"
      ].channels.$get({
        param: { workspaceId },
      });

       if (!response.ok) {
        throw new Error("Failed to get channels");
      }
      return (await response.json()).channels;
    },
  });

  return query;
};
