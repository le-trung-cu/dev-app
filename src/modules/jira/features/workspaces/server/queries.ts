import { jiraDBPrismaClient } from "@/lib/jira-prisma-client";

export async function getWorkspaces(userId: string) {
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
  return workspaceWithRole;
}