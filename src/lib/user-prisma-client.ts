import { PrismaClient } from "../generated/prisma-user-database/user-database-client-types";

const getPrisma = () => new PrismaClient();

const globalForUserDBPrismaClient = global as unknown as {
  userDBPrismaClient: ReturnType<typeof getPrisma>;
};

export const userDBPrismaClient =
  globalForUserDBPrismaClient.userDBPrismaClient || getPrisma();

if (process.env.NODE_ENV !== "production")
  globalForUserDBPrismaClient.userDBPrismaClient = userDBPrismaClient;