"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { Editor } from "../components";
import { AppStore, makeStore } from "@/modules/canvas/store";
import { useGetProject } from "../../../projects/api/use-get-project";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/modules/jira/features/tasks/hooks/use-project-id";
import { Loader } from "lucide-react";

export default function EditorView() {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const { data, isLoading } = useGetProject({ workspaceId, projectId });
  if (isLoading)
    return (
      <div className="min-h-[200px] flex justify-center items-center">
        <Loader className="animate-spin" />
      </div>
    );
  if (!data) {
    throw new Error("Not found project");
  }

  return (
    <Editor
      initialValues={{
        width: data.width,
        height: data.height,
        json: data.json,
      }}
    />
  );
}
