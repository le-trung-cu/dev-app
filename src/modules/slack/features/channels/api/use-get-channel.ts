import { TaskStatus } from "@/generated/prisma-jira-database/jira-database-client-types";
import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.chats.workspaces[":workspaceId"]["channels"][":channelId"]["$get"], 200>
export type Channel = ResponseType["channel"];

export const useGetChannel = ({
  workspaceId,
  channelId,
}: {
  workspaceId: string;
  channelId: string;
}) => {
  const query = useQuery({
    enabled: !!workspaceId && !!channelId,
    queryKey: ["channel", channelId],
    queryFn: async () => {
      const response = await client.api.chats.workspaces[":workspaceId"].channels[
        ":channelId"
      ].$get({
        param: {
          workspaceId,
          channelId
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get channel");
      }
      return (await response.json()).channel;
    },
  });

  return query;
};
