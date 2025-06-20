import { auth } from "@/lib/auth";
import { Hono } from "hono";
import { headers } from "next/headers";
import { unsplash } from "@/lib/unsplash";

const DEFAULT_COUNT = 50;
const DEFAULT_COLLECTION_IDS = ["317099"];

const app = new Hono().get("/", async (c) => {
  const current = await auth.api.getSession({
    headers: await headers(),
  });
  if (!current) return c.json({ error: "Unauthorized" }, 401);

  const images = await unsplash.photos.getRandom({
    collectionIds: DEFAULT_COLLECTION_IDS,
    count: DEFAULT_COUNT,
  });

  if (images.errors) {
    return c.json({ error: "Something went wrong" }, 400);
  }
  let response = images.response;
  if (!Array.isArray(response)) {
    response = [response];
  }
  return c.json({ data: response });
});

export default app;
