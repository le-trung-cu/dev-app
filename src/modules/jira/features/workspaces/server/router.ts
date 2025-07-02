import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { auth } from "@/lib/auth";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schema";
import { jiraDBPrismaClient } from "@/lib/jira-prisma-client";
import {
  Role,
  TaskStatus,
} from "@/generated/prisma-jira-database/jira-database-client-types";
import { headers } from "next/headers";

const app = new Hono()
  .get("/workspaces", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const userId = session?.user.id;
    const workspaces = await jiraDBPrismaClient.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          where: {
            userId,
          },
        },
      },
    });
    const workspaceWithRole = workspaces.map((item) => {
      const { members, ...workspace } = item;

      return { ...workspace, member: members[0] };
    });

    return c.json({ isSuccess: true, workspaces: workspaceWithRole });
  })
  .get("/workspaces/:workspaceId", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const userId = session?.user.id;
    const workspaceId = c.req.param("workspaceId");
    const member = jiraDBPrismaClient.member.findFirst({
      where: {
        userId,
        workspaceId,
      },
    });
    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const workspace = await jiraDBPrismaClient.workspace.findFirst({
      where: {
        id: workspaceId,
      },
    });

    return c.json({ isSuccess: false, workspace });
  })
  .post("/workspaces", zValidator("form", createWorkspaceSchema), async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const userId = session?.user.id!;

    const { name } = c.req.valid("form");

    const workspace = await jiraDBPrismaClient.workspace.create({
      data: { name, imageUrl: "", userId, inviteCode: "" },
    });

    await jiraDBPrismaClient.member.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: Role.Admin,
        joined: true,
      },
    });

    return c.json({ isSuccess: true, workspaceId: workspace.id });
  })
  .delete("/workspaces/:workspaceId", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const workspaceId =c.req.param("workspaceId");
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
    if (
      workspace.members.length === 0 ||
      workspace.members[0].role !== Role.Admin
    )
      return c.json({ error: "Unauthorized" }, 401);

    jiraDBPrismaClient.workspace.delete({
      where: {
        id: workspaceId,
      },
    });
  })
  .patch(
    "/workspaces/:workspaceId",
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const data = c.req.valid("form");
      const workspaceId = c.req.param("workspaceId");
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
      if (
        workspace.members.length === 0 ||
        workspace.members[0].role !== Role.Admin
      )
        return c.json({ error: "Unauthorized" }, 401);

      jiraDBPrismaClient.workspace.update({
        where: {
          id: workspaceId,
        },
        data: {
          name: data.name,
        },
      });
    }
  )
  .get("/workspaces/:workspaceId/analytics", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const workspaceId = c.req.param("workspaceId");
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

    const [projects, tasks] = await Promise.all([
      jiraDBPrismaClient.project.findMany({
        where: {
          workspaceId,
        },
        orderBy: { createdAt: "desc" },
      }),
      await jiraDBPrismaClient.task.findMany({
        where: {
          workspaceId,
        },
      }),
    ]);
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

    const workspaceProductivityData = [];

    for (const project of projects) {
      const projectTask = tasks.filter((task) => task.projectId === project.id);

      const completedTask = projectTask.filter(
        (task) => task.status === "Done"
      );

      workspaceProductivityData.push({
        projectId: project.name,
        name: project.name,
        completed: completedTask.length,
        total: projectTask.length,
      });
    }

    const stats = {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      totalTaskDone: doneTasks.length,
      totalTaskTodo: todoTasks.length,
      totalTaskInProgress: inProgressTasks.length,
    };

    return c.json({
      stats,
      taskTrendsData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects: projects.slice(0, 5),
    });
  });

export default app;
