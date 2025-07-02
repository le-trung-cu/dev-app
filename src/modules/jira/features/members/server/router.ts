import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { auth } from "@/lib/auth";
import { jiraDBPrismaClient } from "@/lib/jira-prisma-client";
import { Role } from "@/generated/prisma-jira-database/jira-database-client-types";
import { headers } from "next/headers";
import { inviteMembersSchema, updateMemberSchema } from "../schema";
import { userDBPrismaClient } from "@/lib/user-prisma-client";
import { z } from "zod";

const app = new Hono()
  // get members
  .get("/workspaces/:workspaceId/members", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const workspaceId = c.req.param("workspaceId");
    const workspace = await jiraDBPrismaClient.workspace.findFirst({
      where: {
        id: workspaceId,
      },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });
    if (!workspace) return c.json({ error: "NotFound" }, 404);
    if (workspace.members.length === 0)
      return c.json({ error: "Unauthorized" }, 401);

    const members = await jiraDBPrismaClient.member.findMany({
      where: {
        workspaceId,
      },
    });

    const userIds = members.map((x) => x.userId);

    const users = await userDBPrismaClient.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    const memberUsers = members.map((member) => {
      const { email, name, image } = users.find((x) => x.id === member.userId)!;
      return {
        ...member,
        email,
        name,
        image,
      };
    });

    return c.json({ isSuccess: true, members: memberUsers });
  })
  .get("/workspaces/:workspaceId/members/current", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const workspaceId = c.req.param("workspaceId");
    const workspace = await jiraDBPrismaClient.workspace.findFirst({
      where: {
        id: workspaceId,
      },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });
    if (!workspace) return c.json({ error: "NotFound" }, 404);
    if (workspace.members.length === 0)
      return c.json({ error: "Unauthorized" }, 401);
    const user = await userDBPrismaClient.user.findFirst({
      where: {
        id: session.user.id,
      },
    });
    const { name, email, image } = user!;
    return c.json({
      isSuccess: true,
      member: { ...workspace.members[0], name, email, image },
    });
  })
  // invite members
  .put(
    "/workspaces/:workspaceId/members",
    zValidator("json", inviteMembersSchema),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const { userIds, role } = c.req.valid("json");
      const workspaceId = c.req.param("workspaceId");
      const workspace = await jiraDBPrismaClient.workspace.findFirst({
        where: {
          id: workspaceId,
        },
        include: {
          members: {
            where: { userId: session.user.id },
          },
        },
      });
      if (!workspace) return c.json({ error: "NotFound" }, 404);
      const currentMember = workspace.members.find(
        (c) => c.userId === session.user.id
      );
      if (!currentMember || currentMember.role !== Role.Admin) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await jiraDBPrismaClient.member.createMany({
        data: userIds.map((userId) => ({
          workspaceId,
          userId: userId,
          role: role,
          joined: false,
        })),
      });

      return c.json({ isSuccess: true });
    }
  )
  // join
  .put("/workspaces/:workspaceId/join", async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const workspaceId = c.req.param("workspaceId");
    const workspace = await jiraDBPrismaClient.workspace.findFirst({
      where: {
        id: workspaceId,
      },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });
    if (!workspace) return c.json({ error: "NotFound" }, 404);
    if (workspace.members.length === 0)
      return c.json({ error: "Unauthorized" }, 401);
    await jiraDBPrismaClient.member.update({
      where: {
        id: workspace.members[0].id,
      },
      data: {
        joined: true,
      },
    });

    return c.json({ isSuccess: true });
  })
  // update role
  .put(
    "/workspaces/:workspaceId/members/:memberId",
    zValidator(
      "param",
      z.object({
        workspaceId: z.string(),
        memberId: z.string(),
      })
    ),
    zValidator("json", updateMemberSchema),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const { workspaceId, memberId } = c.req.valid("param");
      const role = c.req.valid("json").role;
      const workspace = await jiraDBPrismaClient.workspace.findFirst({
        where: {
          id: workspaceId,
        },
        include: {
          members: {
            where: { OR: [{ userId: session.user.id }, { id: memberId }] },
          },
        },
      });
      if (!workspace) return c.json({ error: "NotFound" }, 404);
      const currentMember = workspace.members.find(
        (c) => c.userId === session.user.id
      );
      if (!currentMember || currentMember.role !== Role.Admin) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const member = await jiraDBPrismaClient.member.update({
        where: {
          id: memberId,
        },
        data: {
          role,
        },
      });

      return c.json({ isSuccess: true, member });
    }
  )
  // kick out member
  .delete(
    "/workspaces/:workspaceId/members/:memberId",
    zValidator(
      "param",
      z.object({
        workspaceId: z.string(),
        memberId: z.string(),
      })
    ),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const { workspaceId, memberId } = c.req.valid("param");

      const workspace = await jiraDBPrismaClient.workspace.findFirst({
        where: {
          id: workspaceId,
        },
        include: {
          members: {
            where: { OR: [{ userId: session.user.id }, { id: memberId }] },
          },
        },
      });
      if (!workspace) return c.json({ error: "NotFound" }, 404);
      const currentMember = workspace.members.find(
        (c) => c.userId === session.user.id
      );
      if (!currentMember || currentMember.role !== Role.Admin) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await jiraDBPrismaClient.member.delete({
        where: {
          id: memberId,
        },
      });

      return c.json({ isSuccess: true });
    }
  );
export default app;
