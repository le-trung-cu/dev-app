import { client } from "@/lib/rpc";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { Message } from "../types";
import { useCallback } from "react";
import { Reaction } from "@/generated/prisma-jira-database/jira-database-client-types";
import { useGetMessage } from "./use-get-message";

type RequestType = InferRequestType<
  (typeof client.api.chats.workspaces)[":workspaceId"]["messages"]["$get"]
>;

type ResponseType = InferResponseType<
  (typeof client.api.chats.workspaces)[":workspaceId"]["messages"]["$get"],
  200
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
      console.log("useGetMessages queryKey", [
        "messages",
        workspaceId,
        channelId ?? null,
        conversationId ?? null,
        parentMessageId ?? null,
      ]);

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

export const useSetQueryDataMessages = () => {
  const queryClient = useQueryClient();

  const setCreatedMessage = useCallback(
    (message: Required<Message>) => {
      queryClient.setQueryData<ReturnType<typeof useGetMessages>["data"]>(
        [
          "messages",
          message.workspaceId,
          message.channelId ?? null,
          message.conversationId ?? null,
          message.parentMessageId ?? null,
        ],
        (oldData) => {
          console.log("setCreatedMessage message:", message);
          console.log("setCreatedMessage queryKey", [
            "messages",
            message.workspaceId,
            message.channelId ?? null,
            message.conversationId ?? null,
            message.parentMessageId ?? null,
          ]);
          console.log({ oldData });
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            return oldData;
          }

          const pages = [...oldData.pages];
          pages[0] = {
            ...pages[0],
            messages: [message, ...pages[0].messages],
          };

          const newData = {
            ...oldData,
            pages,
          };

          return newData;
        }
      );
    },
    [queryClient]
  );

  const setUpdatedMessage = useCallback(
    (message: Required<Message>) => {
      queryClient.setQueryData<ReturnType<typeof useGetMessages>["data"]>(
        [
          "messages",
          message.workspaceId,
          message.channelId ?? null,
          message.conversationId ?? null,
          message.parentMessageId ?? null,
        ],
        (oldData) => {
          console.log("setUpdatedMessage message:", message);
          console.log("setUpdatedMessage queryKey", [
            "messages",
            message.workspaceId,
            message.channelId ?? null,
            message.conversationId ?? null,
            message.parentMessageId ?? null,
          ]);
          console.log({ oldData });
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            return oldData;
          }

          const pages = oldData.pages.map((page) => {
            return {
              ...page,
              messages: page.messages.map((item) => {
                if (item.id === message.id) {
                  return message;
                }
                return item;
              }),
            };
          });

          const newData = {
            ...oldData,
            pages,
          };

          return newData;
        }
      );
    },
    [queryClient]
  );

  const setUpdateReaction = useCallback(
    (
      reaction: Reaction & {
        workspaceId: string;
        channelId: string;
        conversationId: string;
        parentMessageId: string;
        isNew: boolean;
      }
    ) => {
      queryClient.setQueryData<ReturnType<typeof useGetMessages>["data"]>(
        [
          "messages",
          reaction.workspaceId,
          reaction.channelId ?? null,
          reaction.conversationId ?? null,
          reaction.parentMessageId ?? null,
        ],
        (oldData) => {
          console.log({ oldData });
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            return oldData;
          }

          const pages = oldData.pages.map((page) => {
            return {
              ...page,
              messages: page.messages.map((message) => {
                if (message.id === reaction.messageId) {
                  message = { ...message, reactions: { ...message.reactions } };
                 
                  const memberIds = new Set(message.reactions?.[reaction.symbol]?.memberIds ?? []);
                  if (reaction.isNew) {
                    memberIds.add(reaction.memberId);
                  } else {
                    memberIds.delete(reaction.memberId);
                  }
                  if (memberIds.size === 0) {
                    delete message.reactions[reaction.symbol];
                  } else {
                    message.reactions[reaction.symbol] = {
                      count: memberIds.size,
                      memberIds: [...memberIds],
                    };
                  }

                  return message;
                }
                return message;
              }),
            };
          });

          const newData = {
            ...oldData,
            pages,
          };

          return newData;
        }
      );

      queryClient.setQueryData<ReturnType<typeof useGetMessage>["data"]>(
        ["message", reaction.workspaceId ?? null, reaction.messageId ?? null],
        (oldData) => {
          if(!oldData) return;
          const reactions = {...oldData.reactions} 
          const memberIds = new Set(reactions[reaction.symbol]?.memberIds ?? []);
          if(reaction.isNew) {
            memberIds.add(reaction.memberId);
          }else {
            memberIds.delete(reaction.memberId);
          }
          const newReactons  = {...oldData.reactions};

          if(memberIds.size === 0) {
            delete newReactons[reaction.symbol];
          }

          return {
            ...oldData,
            reactions: newReactons
          }
        }
      )
    },
    [queryClient]
  );

  return { setCreatedMessage, setUpdatedMessage, setUpdateReaction };
};
