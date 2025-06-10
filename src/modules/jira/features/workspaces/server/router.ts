import { Hono } from "hono";
import { auth } from "@/lib/auth";
import { userDBPrismaClient } from "@/lib/user-prisma-client";

const app = new Hono()
  .get("/", async (c) => {
    const user = await userDBPrismaClient.user.findMany();
    return c.json({user});
  });


export default app;
