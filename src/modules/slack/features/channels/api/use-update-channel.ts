import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { updateChannelSchema } from "../types";

export const useUpdateChannel = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      workspaceId,
      channelId,
      ...data
    }: z.infer<typeof updateChannelSchema> & {
      workspaceId: string;
      channelId: string;
    }) => {
      const response = await client.api.chats.workspaces[
        ":workspaceId"
      ].channels[":channelId"].$patch({
        param: { workspaceId,  channelId},
        form: {
          ...data,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to update channel");
      }

      return await response.json();
    },
    onSuccess: (_, { workspaceId, channelId }) => {
      toast.success("Channel updated");
      queryClient.invalidateQueries({ queryKey: ["channels", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["channel", channelId] });
    },
    onError: () => {
      toast.error("Failed to updated channel");
    },
  });

  return mutation;
};
