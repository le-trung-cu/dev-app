import { PrismaClient } from "../generated/prisma-jira-database/jira-database-client-types";

const getPrisma = () => new PrismaClient();

const globalForJiraDBPrismaClient = global as unknown as {
  jiraDBPrismaClient: ReturnType<typeof getPrisma>;
};

export const jiraDBPrismaClient =
  globalForJiraDBPrismaClient.jiraDBPrismaClient || getPrisma();

if (process.env.NODE_ENV !== "production")
  globalForJiraDBPrismaClient.jiraDBPrismaClient = jiraDBPrismaClient;


