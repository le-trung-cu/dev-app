import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type RequestType = InferRequestType<
  (typeof client.api.chats.workspaces)[":workspaceId"]["messages"]["$post"]
>;
type ResponseType = InferResponseType<
  (typeof client.api.chats.workspaces)[":workspaceId"]["messages"]["$post"],
  200
>;

export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ param, form }: RequestType) => {
      form = { ...form };
      if (!form.fileUrl) {
        delete form["fileUrl"];
      }
      const response = await client.api.chats.workspaces[
        ":workspaceId"
      ].messages.$post({
        param,
        form,
      });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("Message created");
      const { workspaceId, channelId, conversationId, parentMessageId } =
        data.message;
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
      toast.error("Failed to create message");
    },
  });

  return mutation;
};
