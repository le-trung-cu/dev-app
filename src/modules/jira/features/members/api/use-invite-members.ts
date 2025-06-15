import { Role } from "@/generated/prisma-jira-database/jira-database-client-types";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useInviteMembers = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      workspaceId,
      userIds,
      role,
    }: {
      workspaceId: string | number;
      userIds: string[];
      role: Role;
    }) => {
      const response = await client.api.jira.workspaces[
        ":workspaceId"
      ].members.$put({
        param: { workspaceId: workspaceId as string },
        json: { userIds, role },
      });
      if (!response.ok) {
        throw new Error("Failed to send invite");
      }

      return await response.json();
    },
    onSuccess: (_, { workspaceId }) => {
      toast.success("Invite sended");
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
    onError: () => {
      toast.error("Failed to send invite");
    },
  });

  return mutation;
};
