import { Priority, TaskStatus } from "@/generated/prisma-jira-database/jira-database-client-types";
import { z } from "zod";

export const createTaskSchema = z.object({
  name: z.string().min(1, "Tên công việc không được trống"),
  projectId: z.string().min(1, "Dự án không được trống").nullable(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(Priority),
  endDate: z.string().nullable(),
  assigneeId: z.string().nullable(),
});

export const updateTaskSchema = createTaskSchema;

export const bulkUpdateTasksSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      status: z.nativeEnum(TaskStatus),
      position: z.number().int().positive().min(1000).max(1_000_000),
    })
  ),
});
