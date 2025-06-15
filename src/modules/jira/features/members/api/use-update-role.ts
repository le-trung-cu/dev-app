import { Role } from "@/generated/prisma-jira-database/jira-database-client-types";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      workspaceId,
      memberId,
      role,
    }: {
      workspaceId: string | number;
      memberId: string | number;
      role: Role;
    }) => {
      const response = await client.api.jira.workspaces[":workspaceId"].members[
        ":memberId"
      ].$put({
        param: {
          workspaceId: workspaceId as string,
          memberId: memberId as string,
        },
        json: {
          role,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to set role");
      }

      return await response.json();
    },
    onSuccess: (_, { workspaceId }) => {
      toast.success("Set role success");
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
    onError: () => {
      toast.error("Failed to set role");
    },
  });

  return mutation;
};
