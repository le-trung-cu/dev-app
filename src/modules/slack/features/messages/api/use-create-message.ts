import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { InferRequestType, InferResponseType } from "hono";
import qs from "query-string";
import { toast } from "sonner";

export const useCreateMessage = () => {
  const mutation = useMutation({
    mutationFn: async ({
      query,
      form,
    }: {
      query: {
        workspaceId: string;
        channelId: string;
        parentMessageId?: string;
      };
      form: {
        content: string;
        fileUrl: string | undefined | null;
      };
    }) => {
      form = { ...form };
      if (!form.fileUrl) {
        delete form["fileUrl"];
      }

      const url = qs.stringifyUrl({
        url: `${process.env.NEXT_PUBLIC_APP_URL!}/api/socket/messages`,
        query,
      });
      const response = await axios.post<{isSuccess: true}>(url, form);
      if(!response.data.isSuccess) {
         throw new Error("Failed to create message");
      }
      return true;
    },
    onSuccess: (data) => {
      toast.success("Message created");
    },
    onError: () => {
      toast.error("Failed to create message");
    },
  });

  return mutation;
};

