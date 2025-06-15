import { Hono } from "hono";
import { userDBPrismaClient } from "@/lib/user-prisma-client";

const app = new Hono().get("/users", async (c) => {
  const search = c.req.query("q");
  const users = await userDBPrismaClient.user.findMany({
    where: {
      OR: [
        {
          email: { contains: search },
        },
        {
          name: { contains: search },
        },
      ],
    },
    take: 100,
  });

  return c.json({ isSuccess: true, users });
});

export default app;
