import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { auth } from "@/lib/auth";
import { jiraDBPrismaClient } from "@/lib/jira-prisma-client";
import { Role } from "@/generated/prisma-jira-database/jira-database-client-types";
import { headers } from "next/headers";
import { createProjectSchema } from "../schema";

const app = new Hono();

app
  .get("/:workspaceId/projects", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const workspaceId = parseInt(c.req.param("workspaceId"));
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
        projects: true,
      },
    });

    if (!workspace) return c.json({ error: "NotFound" }, 404);
    if (workspace.members.length === 0)
      return c.json({ error: "Unauthorized" }, 401);

    return c.json({ isSuccess: true, projects: workspace.projects });
  })
  .post(
    "/:workspaceId/projects",
    zValidator("form", createProjectSchema),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);

      const data = c.req.valid("form");

      const workspaceId = parseInt(c.req.param("workspaceId"));
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
      const project = await jiraDBPrismaClient.project.create({
        data: {
          ...data,
          workspaceId,
        },
      });

      return c.json({ isSuccess: true, projectId: project.id });
    }
  );

export default app;
