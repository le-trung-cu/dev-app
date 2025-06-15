import { Role } from "@/generated/prisma-jira-database/jira-database-client-types";
import { z } from "zod";

export const inviteMembersSchema = z.object({
  userIds: z.array(z.string()).min(1, "Required"),
  role: z.nativeEnum(Role),
});
export const updateMemberSchema = z.object({
  role: z.nativeEnum(Role),
});
