import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { updateTaskSchema } from "../schema";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      workspaceId,
      taskId,
    }: {
      workspaceId: string | number;
      taskId: string | number;
    }) => {
      const response = await client.api.jira.workspaces[":workspaceId"].tasks[
        ":taskId"
      ].$delete({
        param: { workspaceId: workspaceId as string, taskId: taskId as string },
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      return await response.json();
    },
    onSuccess: (_, { workspaceId, taskId }) => {
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ["task", workspaceId, taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace-analytics", workspaceId],
      });
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

  return mutation;
};
