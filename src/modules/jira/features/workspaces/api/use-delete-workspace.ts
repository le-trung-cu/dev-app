import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ workspaceId }: { workspaceId: string }) => {
      const response = await client.api.jira.workspaces[":workspaceId"].$delete(
        { param: { workspaceId } }
      );
      if (!response.ok) {
        throw new Error("Failed to delete workspace");
      }

      return await response.json();
    },
    onSuccess: (_, { workspaceId }) => {
      toast.success("Workspace deleted");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
    onError: () => {
      toast.error("Failed to delete workspace");
    },
  });

  return mutation;
};
