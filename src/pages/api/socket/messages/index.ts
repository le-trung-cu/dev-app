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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    let { workspaceId, channelId, conversationId, parentMessageId } =
      req.query as Record<string, string | undefined | null>;
    const { content, fileUrl } = req.body;
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
    let parentMessage: Message | null = null;
    if (parentMessageId) {
      parentMessage = await jiraDBPrismaClient.message.findFirst({
        where: {
          id: parentMessageId,
          workspaceId,
        },
      });
      if (!parentMessage) {
        return res
          .status(404)
          .json({ error: "NotFound", message: "Not found parent message" });
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

    initSocketServer((res as any).socket.server);
    const io = getSocketServer();
    io.to(`chat-room:${workspaceId}`).emit("new-message", {
      message,
    });
    
    return res.status(200).json({ isSuccess: true, message });
  } catch (error) {
    console.log("[MESSAGES_POST]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
