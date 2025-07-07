import { Hono } from "hono";
import { handle } from "hono/vercel";
import jiraWorkspaces from "@/modules/jira/features/workspaces/server/router";
import jiraMembers from "@/modules/jira/features/members/server/router";
import jiraProjects from "@/modules/jira/features/projects/server/router";
import jiraTasks from "@/modules/jira/features/tasks/server/router";
import canvasProjects from "@/modules/canvas/features/projects/server/router";
import slackChannels from "@/modules/slack/features/channels/server/route";
import slackMessages from "@/modules/slack/features/messages/server/route";
import auth from "@/modules/auth/server/router";
import images from "@/modules/images/server/route";

const app = new Hono();

const jira = app.basePath("/api")
  .route("/jira", jiraWorkspaces)
  .route("/jira", jiraMembers)
  .route("/jira", jiraProjects)
  .route("/jira", jiraTasks)
  .route("/jira", auth)
  .route("/canvas", canvasProjects)
  .route("/chats", slackChannels)
  .route("/chats", slackMessages)
  .route("/images", images)

const routes = jira;

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
