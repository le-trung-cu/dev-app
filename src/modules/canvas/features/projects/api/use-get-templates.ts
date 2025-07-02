import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<
  typeof client.api.canvas.templates.$get
>["query"];

export type ResponseType = InferResponseType<
  typeof client.api.canvas.templates.$get
>;

export const useGetTemplates = (apiQuery: RequestType) => {
  const query = useQuery({
    queryKey: ["templates", apiQuery.page, apiQuery.limit],
    queryFn: async () => {
      const response = await client.api.canvas.templates.$get({
        query: apiQuery,
      });
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const { projects } = await response.json();
      return projects;
    },
  });

  return query;
};
