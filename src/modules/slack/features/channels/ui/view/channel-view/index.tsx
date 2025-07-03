"use client";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { useChannelId } from "../../../hooks/use-channelId";
import { useGetChannel } from "../../../api/use-get-channel";
import { Loader, TriangleAlert } from "lucide-react";
import { Header } from "./header";

export const ChannelView = () => {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const { data: channel, isLoading } = useGetChannel({ workspaceId, channelId });

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader className="animate-spin size-5 text-muted-foreground" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <TriangleAlert className="size-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Channel not found
        </span>
      </div>
    );
  }
  
  return (
    <div>
      <Header channel={channel}/>
      {workspaceId}/{channelId}
    </div>
  );
};
