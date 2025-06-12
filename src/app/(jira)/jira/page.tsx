"use client";
import { useGetWorkspaces } from "@/modules/jira/features/workspaces/api/use-get-workspaces";
import { useCreateWorkspaceDialog } from "@/modules/jira/features/workspaces/hooks/use-create-workspace-dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data, isLoading } = useGetWorkspaces();
  const { open, setOpen } = useCreateWorkspaceDialog();
  const router = useRouter();
  useEffect(() => {
    if (data && !isLoading && data.length == 0) {
      setOpen(true);
    } else if (data && data.length > 0) {
      router.push(`/jira/workspaces/${data[0].id}`);
    }
  }, [data, isLoading]);
  return null;
}
