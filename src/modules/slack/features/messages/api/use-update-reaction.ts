import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import queryString from "query-string";
import { toast } from "sonner";

export const useUpdateReaction = () => {
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
        symbol: string;
      };
    }) => {
      const { messageId, ...newQuery } = query;

      const url = queryString.stringifyUrl({
        url: `${process.env.NEXT_PUBLIC_APP_URL!}/api/socket/messages/${messageId}/reactions`,
        query: newQuery,
      });
      const response = await axios.put<{ isSuccess: true }>(url, form);
      if (!response.data.isSuccess) {
        throw new Error("Failed to reaction message");
      }

      return true;
    },
    onSuccess: (data) => {
      toast.success("Update reaction message success");
    },
    onError: () => {
      toast.error("Failed to update reaction message");
    },
  });

  return mutation;
};
