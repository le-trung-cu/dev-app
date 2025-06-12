import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { createWorkspaceSchema } from "../schema";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof createWorkspaceSchema>) => {
      const response = await client.api.jira.workspaces.$post({ form: data });
      if (!response.ok) {
        throw new Error("Failed to create workspace");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Workspace created");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: () => {
      toast.error("Failed to create workspace");
    },
  });

  return mutation;
};
