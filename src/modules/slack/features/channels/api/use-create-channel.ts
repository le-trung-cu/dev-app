import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { createChannelSchema } from "../types";

export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      workspaceId,
      ...data
    }: z.infer<typeof createChannelSchema> & {
      workspaceId: string;
    }) => {
      const response = await client.api.chats.workspaces[
        ":workspaceId"
      ].channels.$post({
        param: { workspaceId: workspaceId as string },
        form: {
          ...data,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to create channel");
      }

      return await response.json();
    },
    onSuccess: (_, { workspaceId }) => {
      toast.success("Channel created");
      queryClient.invalidateQueries({ queryKey: ["channels", workspaceId] });
    },
    onError: () => {
      toast.error("Failed to create channel");
    },
  });

  return mutation;
};
