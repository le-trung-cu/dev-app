"use client";
import { Loader } from "lucide-react";
import { useGetWorkspace } from "../../../api/use-get-workspace";
import { useWorkspaceId } from "../../../hooks/use-workspace-id";
import { EditWorkspace } from "./edit-workspace";
import { InviteCodeMember } from "./invite-code-member";
import { DeleteWorkspace } from "./delete-workspace";

export const SettingsView = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspace, isLoading } = useGetWorkspace({ workspaceId });

  if (isLoading) {
    return (
      <div className="h-[300px] flex justify-center items-center">
        <Loader className="animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-10 max-w-2xl">
      <EditWorkspace initialValues={workspace!} />
      <DeleteWorkspace />
    </div>
  );
};
