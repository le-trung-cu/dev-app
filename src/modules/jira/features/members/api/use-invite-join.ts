import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useInviteJoin = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ workspaceId }: { workspaceId: string | number }) => {
      const response = await client.api.jira.workspaces[
        ":workspaceId"
      ].join.$put({
        param: { workspaceId: workspaceId as string },
      });
      if (!response.ok) {
        throw new Error("Failed to join workspace");
      }

      return await response.json();
    },
    onSuccess: (_, { workspaceId }) => {
      toast.success("Joined workspace success");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["current-member", workspaceId] });
    },
    onError: () => {
      toast.error("Failed to join workspace");
    },
  });

  return mutation;
};
