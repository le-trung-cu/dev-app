import { client } from "@/lib/rpc";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<
  (typeof client.api.chats.workspaces)[":workspaceId"]["messages"]["$get"]
>;

type ResponseType = InferResponseType<
  (typeof client.api.chats.workspaces)[":workspaceId"]["messages"]["$get"], 200
>;

export const useGetMessages = ({ param, query }: RequestType) => {
  const { workspaceId } = param;
  let { channelId, conversationId, parentMessageId } = query;

  const infiniteQuery = useInfiniteQuery<ResponseType>({
    enabled: !!param.workspaceId,
    queryKey: [
      "messages",
      workspaceId,
      channelId ?? null,
      conversationId ?? null,
      parentMessageId ?? null,
    ],
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    queryFn: async ({ pageParam }): Promise<ResponseType> => {
      const response = await client.api.chats.workspaces[
        ":workspaceId"
      ].messages.$get({
        param,
        query: {
          ...query,
          cursor: pageParam as string,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return (await response.json()) as ResponseType;
    },
  });

  return infiniteQuery;
};
