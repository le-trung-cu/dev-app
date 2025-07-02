import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type RequestType = InferRequestType<
  (typeof client.api.canvas.workspaces)[":workspaceId"]["projects"]["$post"]
>["json"];

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      workspaceId,
      json,
    }: {
      workspaceId: string;
      json: RequestType;
    }) => {
      const response = await client.api.canvas.workspaces[
        ":workspaceId"
      ].projects.$post({
        param: { workspaceId },
        json,
      });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Project created");

      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error("Failed to create project");
    },
  });

  return mutation;
};
