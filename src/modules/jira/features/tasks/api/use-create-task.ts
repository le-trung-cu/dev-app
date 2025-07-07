import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { createTaskSchema } from "../../tasks/schema";

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      workspaceId,
      ...data
    }: z.infer<typeof createTaskSchema> & {
      workspaceId: string | number;
    }) => {
      const response = await client.api.jira.workspaces[
        ":workspaceId"
      ].tasks.$post({
        param: { workspaceId: workspaceId as string },
        json: {
          ...data,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      return await response.json();
    },
    onSuccess: (_, { workspaceId, projectId }) => {
      toast.success("Task created");
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ["workspace-analytics", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-analytics", workspaceId],
      });
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });

  return mutation;
};
