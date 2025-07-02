import { InferResponseType } from "hono";
import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export type ResponseType = InferResponseType<
  (typeof client.api.canvas.workspaces)[":workspaceId"]["projects"]["$get"],
  200
>;

export const useGetProjects = ({
  workspaceId,
}: {
  workspaceId: string | number;
}) => {
  const query = useInfiniteQuery<ResponseType, Error>({
    enabled: !!workspaceId?.toString(),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    queryKey: ["projects", workspaceId?.toString()],
    queryFn: async ({ pageParam }) => {
      const response = await client.api.canvas.workspaces[
        ":workspaceId"
      ].projects.$get({
        param: {
          workspaceId: workspaceId as string,
        },
        query: {
          page: (pageParam as number).toString(),
          limit: "5",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      return response.json();
    },
  });

  return query;
};
