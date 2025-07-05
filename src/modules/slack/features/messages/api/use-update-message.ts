import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";
import { toast } from "sonner";

type RequestType = InferRequestType<
  (typeof client.api.chats.workspaces)[":workspaceId"]["messages"][":messageId"]["$patch"]
>;

export const useUpdateMessage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ param, form }: RequestType) => {
      const response = await client.api.chats.workspaces[
        ":workspaceId"
      ].messages[":messageId"].$patch({
        param,
        form,
      });
      if (!response.ok) {
        throw new Error("Failed to update message");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      const { workspaceId, channelId, conversationId, parentMessageId } =
        data.message;
      toast.success("Channel updated");
      queryClient.invalidateQueries({
        queryKey: [
          "messages",
          workspaceId,
          channelId,
          conversationId,
          parentMessageId,
        ],
      });
    },
    onError: () => {
      toast.error("Failed to updated channel");
    },
  });

  return mutation;
};
