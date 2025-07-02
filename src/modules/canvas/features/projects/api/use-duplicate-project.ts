import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";


type ResponseType = InferResponseType<typeof client.api.canvas.workspaces[":workspaceId"]["projects"][":projectId"]["duplicate"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.canvas.workspaces[":workspaceId"]["projects"][":projectId"]["duplicate"]["$post"]>["param"];

export const useDuplicateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (param) => {
      const response = await client.api.canvas.workspaces[":workspaceId"].projects[":projectId"].duplicate.$post({ 
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate project");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error("Failed to duplicate project");
    }
  });

  return mutation;
};
