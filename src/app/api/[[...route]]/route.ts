import { Hono } from "hono";
import { handle } from "hono/vercel";
import jiraWorkspaces from "@/modules/jira/features/workspaces/server/router";

const app = new Hono();

const jira = app.basePath("/api/jira")
  .route("", jiraWorkspaces);

const routes = jira;

export const GET = handle(app);
export const POST = handle(app);

export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
