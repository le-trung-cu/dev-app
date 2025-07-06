import { client } from "@/lib/rpc";
import {
  useQuery,
} from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<
  (typeof client.api.chats.workspaces)[":workspaceId"]["messages"][":messageId"]["$get"]
>;

type ResponseType = InferResponseType<
  (typeof client.api.chats.workspaces)[":workspaceId"]["messages"][":messageId"]["$get"],
  200
>;

export const useGetMessage = ({ param }: RequestType) => {
  const { workspaceId, messageId } = param;
  const infiniteQuery = useQuery({
    enabled: !!workspaceId && !!messageId,
    queryKey: ["message", workspaceId, messageId],
    queryFn: async () => {
      const response = await client.api.chats.workspaces[
        ":workspaceId"
      ].messages[":messageId"].$get({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch message");
      }
      return (await response.json()).message;
    },
  });

  return infiniteQuery;
};
