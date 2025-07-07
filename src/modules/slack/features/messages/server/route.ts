import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { auth } from "@/lib/auth";
import { jiraDBPrismaClient } from "@/lib/jira-prisma-client";
import { headers } from "next/headers";
import { z } from "zod";
import {
  Message,
  Reaction,
} from "@/generated/prisma-jira-database/jira-database-client-types";
import { createMessageSchema, updateMessageSchema } from "../types";

const MESSAGES_BATCH = 10;

const app = new Hono()
  .get(
    "/workspaces/:workspaceId/messages",
    zValidator("param", z.object({ workspaceId: z.string() })),
    zValidator(
      "query",
      z.object({
        cursor: z.string().optional(),
        channelId: z.string().optional(),
        conversationId: z.string().optional(),
        parentMessageId: z.string().optional(),
      })
    ),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const { workspaceId } = c.req.valid("param");
      let { channelId, conversationId, parentMessageId, cursor } =
        c.req.valid("query");
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

      if (!!parentMessageId) {
        channelId = undefined;
        conversationId = undefined;
      }
      let messages: (Message & {
        reactions: Reaction[];
        replies: Pick<Message,  "id" | "memberId">[];
      })[] = [];

      if (cursor) {
        messages = await jiraDBPrismaClient.message.findMany({
          where: {
            channelId,
            conversationId,
            parentMessageId: parentMessageId ?? null,
          },
          cursor: {
            id: cursor,
          },
          skip: 1,
          take: MESSAGES_BATCH,
          include: {
            member: true,
            reactions: true,
            replies: {
              select: {
                id: true,
                memberId: true,
              }
            }
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      } else {
        messages = await jiraDBPrismaClient.message.findMany({
          where: {
            channelId,
            conversationId,
            parentMessageId: parentMessageId ?? null,
          },
          take: MESSAGES_BATCH,
          include: {
            member: true,
            reactions: true,
            replies: {
              select: {
                id: true,
                memberId: true,
              }
            }
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      const messagesResult = messages.map((message) => {
        const reactions = reduceReactions(message.reactions);

        return {
          ...message,
          reactions,
        };
      });

      let nextCursor = null;
      if (messages.length === MESSAGES_BATCH) {
        nextCursor = messages[MESSAGES_BATCH - 1].id;
      }

      return c.json({ isSuccess: true, messages: messagesResult, nextCursor });
    }
  )
  .get(
    "/workspaces/:workspaceId/messages/:messageId",
    zValidator(
      "param",
      z.object({ workspaceId: z.string(), messageId: z.string() })
    ),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const { workspaceId, messageId } = c.req.valid("param");
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

      const message = await jiraDBPrismaClient.message.findFirst({
        where: {
          workspaceId,
          id: messageId,
        },
        include: {
          member: true,
          reactions: true,
        },
      });

      const messageResult = !message
        ? null
        : {
            ...message,
            reactions: reduceReactions(message?.reactions),
          };

      if (!message) {
        return c.json({ error: "NotFound" }, 404);
      }
      return c.json({ isSuccess: true, message: messageResult });
    }
  )
  .post(
    "/workspaces/:workspaceId/messages",
    zValidator("param", z.object({ workspaceId: z.string() })),
    zValidator("form", createMessageSchema),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);

      let { content, channelId, conversationId, fileUrl, parentMessageId } =
        c.req.valid("form");

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

      let parentMessage: Message | null = null;
      if (parentMessageId) {
        parentMessage = await jiraDBPrismaClient.message.findFirst({
          where: {
            id: parentMessageId,
            workspaceId,
          },
        });
        if (!parentMessage) {
          return c.json(
            { error: "NotFound", message: "Not found parent message" },
            404
          );
        }
        channelId = parentMessage.channelId;
        conversationId = parentMessage.conversationId;
      }

      const message = await jiraDBPrismaClient.message.create({
        data: {
          workspaceId,
          content,
          channelId,
          conversationId,
          fileUrl,
          parentMessageId,
          deleted: false,
          memberId: workspace.members[0].id,
        },
        include: {
          reactions: true,
          replies: {
            select: {
              id: true,
              memberId: true,
            }
          }
        }
      });

      return c.json({ isSuccess: true, message });
    }
  )
  .patch(
    "/workspaces/:workspaceId/messages/:messageId",
    zValidator(
      "param",
      z.object({ workspaceId: z.string(), messageId: z.string() })
    ),
    zValidator("form", updateMessageSchema),
    async (c) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return c.json({ error: "Unauthorized" }, 401);

      const data = c.req.valid("form");

      const { workspaceId, messageId } = c.req.valid("param");
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

      let message = await jiraDBPrismaClient.message.findFirst({
        where: {
          workspaceId,
          id: messageId,
        },
      });

      if (!workspace || !message) return c.json({ error: "NotFound" }, 404);
      if (
        workspace.members.length === 0 ||
        message.memberId !== workspace.members[0].id
      )
        return c.json({ error: "Unauthorized" }, 401);

      message = await jiraDBPrismaClient.message.update({
        where: {
          id: messageId,
        },
        data: {
          ...data,
        },
      });

      return c.json({ isSuccess: true, message });
    }
  );
// .delete(
//   "/workspaces/:workspaceId/channels/:channelId",
//   zValidator(
//     "param",
//     z.object({ workspaceId: z.string(), channelId: z.string() })
//   ),
//   async (c) => {
//     const session = await auth.api.getSession({
//       headers: await headers(),
//     });
//     if (!session) return c.json({ error: "Unauthorized" }, 401);

//     const { workspaceId, channelId } = c.req.valid("param");
//     const userId = session.user.id;

//     const workspace = await jiraDBPrismaClient.workspace.findFirst({
//       where: {
//         id: workspaceId,
//       },
//       include: {
//         members: {
//           where: {
//             userId,
//           },
//         },
//         channels: {
//           where: {
//             id: channelId,
//           },
//         },
//       },
//     });

//     if (!workspace || workspace.channels.length === 0)
//       return c.json({ error: "NotFound" }, 404);
//     if (workspace.members.length === 0)
//       return c.json({ error: "Unauthorized" }, 401);

//     const channel = await jiraDBPrismaClient.channel.delete({
//       where: {
//         id: channelId,
//         workspaceId,
//       },
//     });

//     return c.json({ isSuccess: true, channelId: channel.id });
//   }
// );

export default app;

function reduceReactions(reactions: Reaction[]) {
  return reactions.reduce(
    (result, item) => {
      if (!result[item.symbol]) {
        result[item.symbol] = {
          count: 0,
          memberIds: [],
        };
      }
      result[item.symbol].count += 1;
      result[item.symbol].memberIds.push(item.memberId);

      return result;
    },
    {} as Record<string, { count: number; memberIds: string[] }>
  );
}
