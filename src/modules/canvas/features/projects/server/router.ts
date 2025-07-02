import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { auth } from "@/lib/auth";
import { jiraDBPrismaClient } from "@/lib/jira-prisma-client";
import { Role } from "@/generated/prisma-jira-database/jira-database-client-types";
import { headers } from "next/headers";
import { z } from "zod";

const app = new Hono()
  .get(
    "/templates",
    zValidator(
      "query",
      z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      })
    ),
    async (c) => {
      const { page, limit } = c.req.valid("query");

      const projects = await jiraDBPrismaClient.canvasProject.findMany({
        where: {
          isTemplate: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        // orderBy: {
        //   updatedAt: "desc",
        // },
      });

      return c.json({ isSuccess: true, projects });
    }
  )
  .delete(
    "/workspaces/:workspaceId/projects/:projectId",
    zValidator(
      "param",
      z.object({ workspaceId: z.coerce.number(), projectId: z.coerce.number() })
    ),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const { workspaceId, projectId } = c.req.valid("param");
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
          canvasProjects: {
            where: {
              id: projectId,
            },
          },
        },
      });

      if (!workspace || workspace.canvasProjects.length === 0)
        return c.json({ error: "NotFound" }, 404);
      if (workspace.members.length === 0)
        return c.json({ error: "Unauthorized" }, 401);

      await jiraDBPrismaClient.canvasProject.delete({
        where: {
          id: projectId,
        },
      });
      return c.json({ isSuccess: true });
    }
  )
  .post(
    "/workspaces/:workspaceId/projects/:projectId/duplicate",
    zValidator(
      "param",
      z.object({ workspaceId: z.number(), projectId: z.number() })
    ),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const { workspaceId, projectId } = c.req.valid("param");
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
          canvasProjects: {
            where: {
              id: projectId,
            },
          },
        },
      });

      if (!workspace || workspace.canvasProjects.length === 0)
        return c.json({ error: "NotFound" }, 404);
      if (workspace.members.length === 0)
        return c.json({ error: "Unauthorized" }, 401);
      const { id, createdAt, updatedAt, ...project } =
        workspace.canvasProjects[0];
      const newProject = await jiraDBPrismaClient.canvasProject.create({
        data: project,
      });
      return c.json({ isSuccess: true, project: newProject });
    }
  )
  .get(
    "/workspaces/:workspaceId/projects",
    zValidator(
      "param",
      z.object({
        workspaceId: z.coerce.number(),
      })
    ),
    zValidator(
      "query",
      z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      })
    ),
    async (c) => {
      const { page, limit } = c.req.valid("query");
      const { workspaceId } = c.req.valid("param");

      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
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

      const projects = await jiraDBPrismaClient.canvasProject.findMany({
        where: {
          workspaceId,
          isTemplate: false,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      return c.json({
        isSuccess: true,
        data: projects,
        nextPage: projects.length === limit ? page + 1 : null,
      });
    }
  )
  .patch(
    "/workspaces/:workspaceId/projects/:projectId",
    zValidator(
      "param",
      z.object({
        workspaceId: z.coerce.number(),
        projectId: z.coerce.number(),
      })
    ),
    zValidator(
      "json",
      z
        .object({
          name: z.string().min(1),
          json: z.string(),
          height: z.coerce.number(),
          width: z.coerce.number(),
        })
        .partial()
    ),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const { workspaceId, projectId } = c.req.valid("param");
      const values = c.req.valid("json");

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
          canvasProjects: {
            where: {
              id: projectId,
            },
          },
        },
      });

      if (!workspace || workspace.canvasProjects.length === 0)
        return c.json({ error: "NotFound" }, 404);
      if (workspace.members.length === 0)
        return c.json({ error: "Unauthorized" }, 401);

      const data = await jiraDBPrismaClient.canvasProject.update({
        data: {
          ...values,
        },
        where: {
          id: workspace.canvasProjects[0].id,
        },
      });

      return c.json({ project: data });
    }
  )
  .get(
    "/workspaces/:workspaceId/projects/:projectId",
    zValidator(
      "param",
      z.object({ workspaceId: z.coerce.number(), projectId: z.coerce.number() })
    ),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const { workspaceId, projectId } = c.req.valid("param");
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
          canvasProjects: {
            where: {
              id: projectId,
            },
          },
        },
      });

      if (!workspace || workspace.canvasProjects.length === 0)
        return c.json({ error: "NotFound" }, 404);
      if (workspace.members.length === 0)
        return c.json({ error: "Unauthorized" }, 401);

      return c.json({ isSuccess: true, project: workspace.canvasProjects[0] });
    }
  )
  .post(
    "/workspaces/:workspaceId/projects",
    zValidator(
      "json",
      z.object({
        name: z.string().min(1),
        json: z.string(),
        width: z.number().min(1),
        height: z.number().min(1),
      })
    ),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const workspaceId = parseInt(c.req.param("workspaceId"));
      const { name, json, height, width } = c.req.valid("json");
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

      const project = await jiraDBPrismaClient.canvasProject.create({
        data: {
          name,
          json,
          height,
          width,
          workspaceId,
          userId,
          isTemplate: false,
        },
      });

      return c.json({ isSuccess: true, project });
    }
  );

export default app;
