import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { InferRequestType } from "hono";
import queryString from "query-string";
import { toast } from "sonner";

type RequestType = InferRequestType<
  (typeof client.api.chats.workspaces)[":workspaceId"]["messages"][":messageId"]["$patch"]
>;

export const useUpdateMessage = () => {
  const mutation = useMutation({
    mutationFn: async ({
      query,
      form,
    }: {
      query: {
        workspaceId: string;
        messageId: string;
      };
      form: {
        content: string;
        fileUrl?: string | null;
      };
    }) => {
      const { messageId, ...newQuery } = query;

      const url = queryString.stringifyUrl({
        url: `${process.env.NEXT_PUBLIC_APP_URL!}/api/socket/messages/${messageId}`,
        query: newQuery,
      });
      const response = await axios.patch<{ isSuccess: true }>(url, form);
      if (!response.data.isSuccess) {
        throw new Error("Failed to update message");
      }

      return true;
    },
    onSuccess: (data) => {
      toast.success("Update message success");
    },
    onError: () => {
      toast.error("Failed to update message");
    },
  });

  return mutation;
};
