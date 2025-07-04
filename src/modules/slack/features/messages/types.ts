import { z } from "zod";

export const createMessageSchema = z.object({
  fileUrl: z.string().nullish(),
  channelId: z.string().nullish(),
  conversationId: z.string().nullish(),
  parentMessageId: z.string().nullish(),
  content: z.string(),
})