import { InferResponseType } from "hono";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export type ResponseType = InferResponseType<
  (typeof client.api.canvas.workspaces)[":workspaceId"]["projects"][":projectId"]["$get"],
  200
>;

export const useGetProject = ({
  workspaceId,
  projectId,
}: {
  workspaceId: string | number;
  projectId: string | number;
}) => {
  const query = useQuery({
    enabled: !!workspaceId && !!projectId,
    queryKey: ["project", workspaceId, projectId],
    queryFn: async () => {
      const response = await client.api.canvas.workspaces[
        ":workspaceId"
      ].projects[":projectId"].$get({
        param: {
          workspaceId: workspaceId as string,
          projectId: projectId as string,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }

      const { project } = await response.json();
      return project;
    },
  });

  return query;
};
