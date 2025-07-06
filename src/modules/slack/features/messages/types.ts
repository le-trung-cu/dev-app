import { Message as MessageModel } from "@/generated/prisma-jira-database/jira-database-client-types";
import { z } from "zod";

export const createMessageSchema = z.object({
  fileUrl: z.string().nullish(),
  channelId: z.string().nullish(),
  conversationId: z.string().nullish(),
  parentMessageId: z.string().nullish(),
  content: z.string(),
});

export const updateMessageSchema = z.object({
  content: z.string(),
});

export type Message = Omit<MessageModel, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  reactions?: {
    [x: string]: {
      count: number;
      memberIds: string[];
    };
  };
  replies?: {
    id: string;
    memberId: string;
  }[]
};
