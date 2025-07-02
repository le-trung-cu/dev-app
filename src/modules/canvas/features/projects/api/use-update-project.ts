import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.canvas.workspaces)[":workspaceId"]["projects"][":projectId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.canvas.workspaces)[":workspaceId"]["projects"][":projectId"]["$patch"]
>["json"];

export const useUpdateProject = ({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["project", workspaceId, projectId],
    mutationFn: async (json: RequestType) => {
      const response = await client.api.canvas.workspaces[
        ":workspaceId"
      ].projects[":projectId"].$patch({
        json,
        param: {
          workspaceId,
          projectId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: () => {
      toast.error("Failed to update project");
    },
  });

  return mutation;
};
