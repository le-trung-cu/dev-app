import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { updateChannelSchema } from "../types";

export const useDeleteChannel = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      workspaceId,
      channelId,
    } : {
      workspaceId: string;
      channelId: string;
    }) => {
      const response = await client.api.chats.workspaces[
        ":workspaceId"
      ].channels[":channelId"].$delete({
        param: { workspaceId, channelId },
      });
      if (!response.ok) {
        throw new Error("Failed to delete channel");
      }

      return await response.json();
    },
    onSuccess: (_, { workspaceId, channelId }) => {
      toast.success("Channel deleted");
      queryClient.invalidateQueries({ queryKey: ["channels", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["channel", channelId] });
    },
    onError: () => {
      toast.error("Failed to deleted channel");
    },
  });

  return mutation;
};
