import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { createProjectSchema } from "../schema";

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      workspaceId,
      ...data
    }: z.infer<typeof createProjectSchema> & {
      workspaceId: string;
    }) => {
      const response = await client.api.jira.workspaces[
        ":workspaceId"
      ].projects.$post({
        param: { workspaceId: workspaceId! },
        form: {
          ...data,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      return await response.json();
    },
    onSuccess: (_, { workspaceId }) => {
      toast.success("Project created");
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
    },
    onError: () => {
      toast.error("Failed to create project");
    },
  });

  return mutation;
};
