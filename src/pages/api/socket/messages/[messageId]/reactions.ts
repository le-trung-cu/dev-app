import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { getSocketServer, initSocketServer } from "@/lib/socket";
import { jiraDBPrismaClient } from "@/lib/jira-prisma-client";
import { Reaction } from "@/generated/prisma-jira-database/jira-database-client-types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "DELETE" && req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    let { workspaceId, messageId } = req.query as Record<string, string>;
    const { symbol } = req.body as Record<string, string>;
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

    const message = await jiraDBPrismaClient.message.findFirst({
      where: {
        workspaceId,
        id: messageId,
      },
    });

    if (!message) return res.status(404).json({ error: "NotFound" });

    const memberId = workspace.members[0].id as string;
    let result: Reaction | null = null;
    let isNew = true;
    const exist = await jiraDBPrismaClient.reaction.findFirst({
      where: {
        messageId,
        memberId,
        symbol,
      },
    });
    if (req.method === "DELETE" || exist) {
      result = await jiraDBPrismaClient.reaction.delete({
        where: {
          messageId_memberId_symbol: {
            messageId,
            memberId,
            symbol,
          },
        },
      });
      isNew = false;
    }
    else if (req.method === "PUT") {
      result = await jiraDBPrismaClient.reaction.create({
        data: {
          messageId,
          memberId,
          symbol,
        },
      });
    }

    initSocketServer((res as any).socket.server);
    const io = getSocketServer();
    io.to(`chat-room:${workspaceId}`).emit("update-reaction", {
      reaction: {
        ...result,
        isNew,
        workspaceId: message.workspaceId,
        channelId: message.channelId,
        conversationId: message.conversationId,
        parentMessageId: message.parentMessageId,
      },
    });

    return res.status(200).json({
      isSuccess: true,
      reaction: {
        ...result,
        isNew,
        workspaceId: message.workspaceId,
        channelId: message.channelId,
        conversationId: message.conversationId,
        parentMessageId: message.parentMessageId,
      },
    });
  } catch (error) {
    console.log("[MESSAGES_REACTION]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
