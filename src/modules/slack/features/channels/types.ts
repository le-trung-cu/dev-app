import { ChannelType } from "@/generated/prisma-jira-database/jira-database-client-types";
import { z } from "zod";
import { Hash, Mic, Video } from "lucide-react";

export const createChannelSchema = z.object({
  name: z.string().trim().min(1, "Tên channel là bắt buộc"),
  type: z.nativeEnum(ChannelType)
});

export const updateChannelSchema = createChannelSchema;

export const iconMap = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Mic,
  [ChannelType.VIDEO]: Video,
};