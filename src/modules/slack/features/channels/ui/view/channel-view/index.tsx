"use client";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { useChannelId } from "../../../hooks/use-channelId";
import { useGetChannel } from "../../../api/use-get-channel";
import { Loader, TriangleAlert } from "lucide-react";
import { Header } from "./header";
import { ChatInput } from "./chat-input";
import { useGetMessages } from "@/modules/slack/features/messages/api/use-get-messages";
import { Button } from "@/components/ui/button";

export const ChannelView = () => {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const { data: channel, isLoading } = useGetChannel({
    workspaceId,
    channelId,
  });

  const {
    data: messages,
    fetchNextPage,
    hasNextPage,
  } = useGetMessages({
    param: { workspaceId },
    query: { channelId },
  });

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
        <span className="text-sm text-muted-foreground">Channel not found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header channel={channel} />
      <div className="flex justify-center">
        {hasNextPage && (
          <Button onClick={() => fetchNextPage()}>load more</Button>
        )}
      </div>
      <div className="flex-1">
        {messages?.pages
          ?.flatMap((page) => page.messages)
          .map((item) => <div key={item.id}>{item.content}</div>)}
      </div>
      <ChatInput />
    </div>
  );
};
