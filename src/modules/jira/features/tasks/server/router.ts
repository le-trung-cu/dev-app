import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { auth } from "@/lib/auth";
import { jiraDBPrismaClient } from "@/lib/jira-prisma-client";
import {
  Priority,
  Role,
  TaskStatus,
} from "@/generated/prisma-jira-database/jira-database-client-types";
import { headers } from "next/headers";
import {
  bulkUpdateTasksSchema,
  createTaskSchema,
  updateTaskSchema,
} from "../schema";
import { userDBPrismaClient } from "@/lib/user-prisma-client";
import { boolean } from "zod/v4";
import { User } from "@/generated/prisma-user-database/user-database-client-types";

const app = new Hono()
  .get("/workspaces/:workspaceId/tasks", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const workspaceId = parseInt(c.req.param("workspaceId"));
    const userId = session.user.id;

    const member = jiraDBPrismaClient.member.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    const where: {
      projectId?: number;
      assigneeId?: number;
      endDate?: { lte: Date };
      status?: TaskStatus;
    } = {
      projectId: !c.req.query("projectId")
        ? undefined
        : parseInt(c.req.query("projectId") as string),
      assigneeId: !c.req.query("assigneeId")
        ? undefined
        : parseInt(c.req.query("assigneeId") as string),
      status: c.req.query("status") as TaskStatus,
      endDate: !c.req.query("endDate")
        ? undefined
        : {
            lte: new Date(c.req.query("endDate") as string),
          },
    };

    const tasks = await jiraDBPrismaClient.task.findMany({
      where,
      include: {
        project: true,
        assignee: true,
      },
    });

    const userIds = [
      ...new Set(
        tasks.map((x) => x.assignee?.userId).filter((x) => x !== undefined)
      ),
    ];
    const users = await userDBPrismaClient.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    const mapUsers = users.reduce(
      (value, item) => {
        value[item.id] = item;
        return value;
      },
      {} as Record<string, User>
    );
    const tasksNew = tasks.map((task) => {
      if (!!task.assignee) {
        const userId = task.assignee.userId;
        const { name, email, image } = mapUsers[userId];
        const newtask = {
          ...task,
          assignee: {
            ...task.assignee,
            name,
            email,
            image,
          },
        };
        return newtask;
      }

      return {
        ...task,
        assignee: null,
      };
    });
    return c.json({ isSuccess: true, tasks: tasksNew });
  })

  .post(
    "/workspaces/:workspaceId/tasks",
    zValidator("json", createTaskSchema),
    async (c) => {
      const values = c.req.valid("json");
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const workspaceId = parseInt(c.req.param("workspaceId"));
      const userId = session.user.id;

      const member = jiraDBPrismaClient.member.findFirst({
        where: {
          workspaceId,
          userId,
        },
      });
      if (!member) return c.json({ error: "Unauthorized" }, 401);

      const task = await jiraDBPrismaClient.task.create({
        data: {
          ...values,
          endDate: !values.endDate ? undefined : new Date(values.endDate!),
          workspaceId,
        },
      });

      return c.json({ isSuccess: true, task });
    }
  )
  .get("/workspaces/:workspaceId/tasks/:taskId", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const workspaceId = parseInt(c.req.param("workspaceId"));
    const taskId = parseInt(c.req.param("taskId"));
    const userId = session.user.id;

    const member = jiraDBPrismaClient.member.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    const task = await jiraDBPrismaClient.task.findFirst({
      where: {
        workspaceId,
        id: taskId,
      },
    });

    if (!task) return c.json({ error: "NotFound" }, 404);

    return c.json({ isSuccess: true, task });
  })
  .put(
    "/workspaces/:workspaceId/tasks/:taskId",
    zValidator("json", updateTaskSchema),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const values = c.req.valid("json");

      const workspaceId = parseInt(c.req.param("workspaceId"));
      const taskId = parseInt(c.req.param("taskId"));
      const userId = session.user.id;

      const member = jiraDBPrismaClient.member.findFirst({
        where: {
          workspaceId,
          userId,
        },
      });
      if (!member) return c.json({ error: "Unauthorized" }, 401);

      const task = await jiraDBPrismaClient.task.update({
        where: {
          workspaceId,
          id: taskId,
        },
        data: {
          ...values,
          endDate: !values.endDate ? undefined : new Date(values.endDate!),
          workspaceId,
        },
      });

      return c.json({ isSuccess: true, task });
    }
  )
  .delete("/workspaces/:workspaceId/tasks/:taskId", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const workspaceId = parseInt(c.req.param("workspaceId"));
    const taskId = parseInt(c.req.param("taskId"));
    const userId = session.user.id;

    const member = jiraDBPrismaClient.member.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    await jiraDBPrismaClient.task.delete({
      where: {
        workspaceId: workspaceId,
        id: taskId,
      },
    });
    return c.json({ isSuccess: true });
  })
  .post(
    "/workspaces/:workspaceId/tasks/bulk-update",
    zValidator("json", bulkUpdateTasksSchema),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const { tasks } = c.req.valid("json");

      const workspaceId = parseInt(c.req.param("workspaceId"));
      const userId = session.user.id;

      const member = jiraDBPrismaClient.member.findFirst({
        where: {
          workspaceId,
          userId,
        },
      });
      if (!member) return c.json({ error: "Unauthorized" }, 401);
      const BATCH_SIZE = 20;

      for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
        const batch = tasks.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map((task) =>
            jiraDBPrismaClient.task.update({
              where: { id: task.id },
              data: {
                position: task.position,
                status: task.status,
              },
            })
          )
        );
      }

      return c.json({ isSuccess: true });
    }
  )
  .get("/workspaces/:workspaceId/projects/:projectId/analytics", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const workspaceId = parseInt(c.req.param("workspaceId"));
    const projectId = parseInt(c.req.param("projectId"));
    const userId = session.user.id;

    const workspace = await jiraDBPrismaClient.workspace.findFirst({
      where: {
        id: workspaceId,
      },
      include: {
        members: {
          where: {
            userId,
          },
        },
      },
    });

    if (!workspace) return c.json({ error: "NotFound" }, 404);
    if (workspace.members.length === 0)
      return c.json({ error: "Unauthorized" }, 401);

    const tasks = await jiraDBPrismaClient.task.findMany({
      where: {
        workspaceId,
        projectId,
      },
    });

    const doneTasks = tasks.filter((x) => x.status === TaskStatus.Done);
    const todoTasks = tasks.filter((x) => x.status === TaskStatus.Todo);
    const inProgressTasks = tasks.filter(
      (x) => x.status === TaskStatus.InProcess
    );

    // get upcoming task in next 7 days

    const upcomingTasks = tasks.filter((task) => {
      const taskDate = task.endDate;
      if (!taskDate) return false;
      const today = new Date();
      return (
        taskDate > today &&
        taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    const taskTrendsData = [
      { name: "Sun", done: 0, inProgress: 0, todo: 0 },
      { name: "Mon", done: 0, inProgress: 0, todo: 0 },
      { name: "Tue", done: 0, inProgress: 0, todo: 0 },
      { name: "Wed", done: 0, inProgress: 0, todo: 0 },
      { name: "Thu", done: 0, inProgress: 0, todo: 0 },
      { name: "Fri", done: 0, inProgress: 0, todo: 0 },
      { name: "Sat", done: 0, inProgress: 0, todo: 0 },
    ];
    // get last 7 days tasks date
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    for (const task of tasks) {
      const taskDate = task.updatedAt;

      const dayInDate = last7Days.findIndex(
        (date) =>
          date.getDate() === taskDate.getDate() &&
          date.getMonth() === taskDate.getMonth() &&
          date.getFullYear() === taskDate.getFullYear()
      );

      if (dayInDate !== -1) {
        const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
          weekday: "short",
        });

        const dayData = taskTrendsData.find((day) => day.name === dayName);

        if (dayData) {
          switch (task.status) {
            case TaskStatus.Done:
              dayData.done++;
              break;
            case TaskStatus.InProcess:
              dayData.inProgress++;
              break;
            case TaskStatus.Todo:
              dayData.todo++;
              break;
          }
        }
      }
    }

    // Task priority distribution
    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];

    for (const task of tasks) {
      switch (task.priority) {
        case "High":
          taskPriorityData[0].value++;
          break;
        case "Medium":
          taskPriorityData[1].value++;
          break;
        case "Low":
          taskPriorityData[2].value++;
          break;
      }
    }


    const stats = {
      totalTasks: tasks.length,
      totalTaskDone: doneTasks.length,
      totalTaskTodo: todoTasks.length,
      totalTaskInProgress: inProgressTasks.length,
    };

    return c.json({
      stats,
      taskTrendsData,
      taskPriorityData,
      upcomingTasks,
    });
  });

export default app;
