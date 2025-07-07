import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { updateTaskSchema } from "../schema";

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      workspaceId,
      taskId,
      ...data
    }: z.infer<typeof updateTaskSchema> & {
      workspaceId: string;
      taskId: string;
    }) => {
      const response = await client.api.jira.workspaces[":workspaceId"].tasks[
        ":taskId"
      ].$put({
        param: { workspaceId, taskId },
        json: {
          ...data,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      return await response.json();
    },
    onSuccess: (_, { workspaceId, taskId }) => {
      toast.success("Task update");
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ["task", workspaceId, taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace-analytics", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-analytics", workspaceId],
      });
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  return mutation;
};
