import { Hono } from "hono";
import { handle } from "hono/vercel";
import jiraWorkspaces from "@/modules/jira/features/workspaces/server/router";
import jiraMembers from "@/modules/jira/features/members/server/router";
import jiraProjects from "@/modules/jira/features/projects/server/router";
import jiraTasks from "@/modules/jira/features/tasks/server/router";
import auth from "@/modules/auth/server/router";

const app = new Hono();

const jira = app.basePath("/api/jira")
  .route("", jiraWorkspaces)
  .route("", jiraMembers)
  .route("", jiraProjects)
  .route("", jiraTasks)
  .route("", auth);

const routes = jira;

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
