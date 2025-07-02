import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.canvas.workspaces)[":workspaceId"]["projects"][":projectId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.canvas.workspaces)[":workspaceId"]["projects"][":projectId"]["$delete"]
>["param"];

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (param) => {
      const response = await client.api.canvas.workspaces[
        ":workspaceId"
      ].projects[":projectId"].$delete({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      return await response.json();
    },
    onSuccess: ({ isSuccess }, { projectId, workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  return mutation;
};
