import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { updateWorkspaceSchema } from "../schema";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      workspaceId,
      data,
    }: {
      workspaceId: string;
      data: z.infer<typeof updateWorkspaceSchema>;
    }) => {
      const response = await client.api.jira.workspaces[":workspaceId"].$patch({
        param: { workspaceId },
        form: data,
      });
      if (!response.ok) {
        throw new Error("Failed to update workspace");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Workspace updated");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: () => {
      toast.error("Failed to update workspace");
    },
  });

  return mutation;
};
