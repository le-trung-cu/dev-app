"use client";

import { useGetWorkspaces } from "@/modules/jira/features/workspaces/api/use-get-workspaces";
import { useCreateWorkspaceModal } from "@/modules/jira/features/workspaces/hooks/use-create-workspace-modal";
import { CreateWorkspaceModal } from "@/modules/jira/features/workspaces/ui/components/create-workspace-modal";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const ClientRender = () => {
    const { data, isLoading } = useGetWorkspaces();
  const { open, setOpen } = useCreateWorkspaceModal();
  const router = useRouter();
  useEffect(() => {
    if (data && !isLoading && data.length == 0) {
      setOpen(true);
    } else if (data && data.length > 0) {
      router.push(`/jira/workspaces/${data[0].id}`);
    }
  }, [data, isLoading]);

  return <CreateWorkspaceModal />
}