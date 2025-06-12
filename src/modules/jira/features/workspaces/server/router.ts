import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { auth } from "@/lib/auth";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schema";
import { jiraDBPrismaClient } from "@/lib/jira-prisma-client";
import { Role } from "@/generated/prisma-jira-database/jira-database-client-types";
import { headers } from "next/headers";

const app = new Hono()
  .get("/workspaces", async (c) => {
    const session = (await auth.$context).session;
    const userId = session?.user.id;
    const workspaces = await jiraDBPrismaClient.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
    return c.json({ isSuccess: true, workspaces });
  })
  .get("/workspaces/:workspaceId", async (c) => {
    const session = (await auth.$context).session;
    const userId = session?.user.id;
    const workspaceId = parseInt(c.req.param("workspaceId"));
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

    const userId = session?.user.id!;

    const { name, image } = c.req.valid("form");

    const workspace = await jiraDBPrismaClient.workspace.create({
      data: { name, imageUrl: "", userId, inviteCode: "" },
    });

    await jiraDBPrismaClient.member.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: Role.Admin,
      },
    });

    return c.json({ isSuccess: true, workspaceId: workspace.id });
  })
  .delete("/workspaces/:workspaceId", async (c) => {
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
  );

export default app;
