import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      workspaceId,
      memberId,
    }: {
      workspaceId: string;
      memberId: string;
    }) => {
      const response = await client.api.jira.workspaces[":workspaceId"].members[
        ":memberId"
      ].$delete({
        param: {
          workspaceId,
          memberId,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete member");
      }

      return await response.json();
    },
    onSuccess: (_, { workspaceId }) => {
      toast.success("Delete member success");
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
    onError: () => {
      toast.error("Failed to delete member");
    },
  });

  return mutation;
};
