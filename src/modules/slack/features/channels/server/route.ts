import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { auth } from "@/lib/auth";
import { jiraDBPrismaClient } from "@/lib/jira-prisma-client";
import { headers } from "next/headers";
import { z } from "zod";
import { createChannelSchema, updateChannelSchema } from "../types";

const app = new Hono()
  .get(
    "/workspaces/:workspaceId/channels",
    zValidator("param", z.object({ workspaceId: z.string() })),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const { workspaceId } = c.req.valid("param");
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
          channels: true,
        },
      });

      if (!workspace) return c.json({ error: "NotFound" }, 404);
      if (workspace.members.length === 0)
        return c.json({ error: "Unauthorized" }, 401);

      return c.json({ isSuccess: true, channels: workspace.channels });
    }
  )
  .get(
    "/workspaces/:workspaceId/channels/:channelId",
    zValidator(
      "param",
      z.object({ workspaceId: z.string(), channelId: z.string() })
    ),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const { workspaceId, channelId } = c.req.valid("param");
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
          channels: {
            where: {
              id: channelId,
            },
          },
        },
      });

      if (!workspace || workspace.channels.length === 0)
        return c.json({ error: "NotFound" }, 404);
      if (workspace.members.length === 0)
        return c.json({ error: "Unauthorized" }, 401);

      return c.json({ isSuccess: true, channel: workspace.channels[0] });
    }
  )
  .post(
    "/workspaces/:workspaceId/channels",
    zValidator("param", z.object({ workspaceId: z.string() })),
    zValidator("form", createChannelSchema),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);

      const data = c.req.valid("form");

      const { workspaceId } = c.req.valid("param");
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
      const channelId = await jiraDBPrismaClient.channel.create({
        data: {
          ...data,
          workspaceId,
        },
      });

      return c.json({ isSuccess: true, channelId: channelId.id });
    }
  )
  .patch(
    "/workspaces/:workspaceId/channels/:channelId",
    zValidator(
      "param",
      z.object({ workspaceId: z.string(), channelId: z.string() })
    ),
    zValidator("form", updateChannelSchema),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);

      const data = c.req.valid("form");

      const { workspaceId, channelId } = c.req.valid("param");
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
          channels: {
            where: {
              id: channelId,
            },
          },
        },
      });

      if (!workspace || workspace.channels.length === 0)
        return c.json({ error: "NotFound" }, 404);
      if (workspace.members.length === 0)
        return c.json({ error: "Unauthorized" }, 401);

      const channel = await jiraDBPrismaClient.channel.update({
        where: {
          id: channelId,
          workspaceId,
        },
        data: {
          ...data,
        },
      });

      return c.json({ isSuccess: true, channel });
    }
  )
  .delete(
    "/workspaces/:workspaceId/channels/:channelId",
    zValidator(
      "param",
      z.object({ workspaceId: z.string(), channelId: z.string() })
    ),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);

      const { workspaceId, channelId } = c.req.valid("param");
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
          channels: {
            where: {
              id: channelId,
            },
          },
        },
      });

      if (!workspace || workspace.channels.length === 0)
        return c.json({ error: "NotFound" }, 404);
      if (workspace.members.length === 0)
        return c.json({ error: "Unauthorized" }, 401);

      const channel = await jiraDBPrismaClient.channel.delete({
        where: {
          id: channelId,
          workspaceId,
        },
      });

      return c.json({ isSuccess: true, channelId: channel.id });
    }
  );

export default app;
