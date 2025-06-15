import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { z } from "zod";
import { bulkUpdateTasksSchema } from "../schema";

export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      workspaceId,
      data,
    }: {
      workspaceId: string | number;
      data: z.infer<typeof bulkUpdateTasksSchema>;
    }) => {
      const response = await client.api.jira.workspaces[":workspaceId"].tasks[
        "bulk-update"
      ].$post({
        param: {
          workspaceId: workspaceId as string,
        },
        json: {
          ...data,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to bulk-updated tasks");
      }

      return await response.json();
    },
    onSuccess: (_, { workspaceId }) => {
      toast.success("Tasks bulk-updated");

      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ["workspace-analytics", workspaceId],
      });
    },
    onError: () => {
      toast.error("Failed to bulk-update tasks");
    },
  });

  return mutation;
};
