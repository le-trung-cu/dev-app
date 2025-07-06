import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { getSocketServer, initSocketServer } from "@/lib/socket";
import { jiraDBPrismaClient } from "@/lib/jira-prisma-client";
import { Message } from "@/generated/prisma-jira-database/jira-database-client-types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    let { workspaceId, channelId, conversationId, messageId } =
      req.query as Record<string, string | undefined | null>;
    const { content } = req.body;
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = session.user.id;

    if (!workspaceId) {
      return res.status(400).json({ error: "Workspace Id missing" });
    }

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

    if (!workspace) return res.status(404).json({ error: "NotFound" });
    if (workspace.members.length === 0)
      return res.status(401).json({ error: "Unauthorized" });

    let message = await jiraDBPrismaClient.message.findFirst({
      where: {
        workspaceId,
        id: messageId!,
      },
      include: {
        member: true,
      }
    });

    if (!message || message.deleted) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (req.method === "DELETE") {
      message = await jiraDBPrismaClient.message.update({
        where: {
          workspaceId,
          id: messageId!,
        },
        data: {
          fileUrl: null,
          content: "Tin nhắn này đã được xoá",
          deleted: true,
        },
        include: {
          member: true,
        }
      });
    }
    if (req.method === "PATCH") {
      message = await jiraDBPrismaClient.message.update({
        where: {
          workspaceId,
          id: messageId!,
        },
        data: {
          content,
        },
        include: {
          member: true,
        },
      });
    }

    initSocketServer((res as any).socket.server);
    const io = getSocketServer();
    io.to(`chat-room:${workspaceId}`).emit("update-message", {
      message,
    });

    return res.status(200).json({ isSuccess: true, message });
  } catch (error) {
    console.log("[MESSAGES_POST]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
