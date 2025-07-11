"use client";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { useChannelId } from "../../../hooks/use-channel-id";
import { useGetChannel } from "../../../api/use-get-channel";
import { Loader, TriangleAlert } from "lucide-react";
import { Header } from "./header";
import { ChatInput } from "./chat-input";
import { useGetMessages } from "@/modules/slack/features/messages/api/use-get-messages";
import { Button } from "@/components/ui/button";
import { MessageList } from "@/modules/slack/features/messages/ui/components/message-list";
import { useState } from "react";
import { useGetCurrentMember } from "@/modules/jira/features/members/api/use-get-current-member";
import { useChatSocket } from "@/modules/slack/hooks/use-chat-socket";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useThreadId } from "@/modules/slack/features/threads/hooks/use-thread-id";
import { ThreadView } from "@/modules/slack/features/threads/ui/view";
import { useGetMembersMap } from "@/modules/jira/features/members/api/use-get-members";
import { ChannelType } from "@/generated/prisma-jira-database/jira-database-client-types";
import { MediaRoom } from "@/modules/slack/components/media-toom";

export const ChannelView = () => {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const [threadId] = useThreadId();

  useChatSocket({ roomId: workspaceId });

  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: currentMember, isLoading: isLoadingMember } =
    useGetCurrentMember({ workspaceId });
  const { data: channel, isLoading: isLoadingChannel } = useGetChannel({
    workspaceId,
    channelId,
  });

  const {
    data: pages,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingMessages,
    isPending,
    isFetching,
  } = useGetMessages({
    param: { workspaceId },
    query: { channelId },
  });

  const messages = pages?.pages.flatMap((page) => page.messages) ?? [];

  if (isLoadingChannel) {
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
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <div className="flex flex-col h-full">
          <Header channel={channel} />
          {channel.type === ChannelType.TEXT && (
            <>
              <div className="flex-1 relative">
                <MessageList
                  messages={messages}
                  editingId={editingId}
                  setEditingId={setEditingId}
                  memberId={currentMember?.id}
                  shouldLoadMore={!isFetching && hasNextPage}
                  loadMore={fetchNextPage}
                  isFetching={isFetching}
                />
              </div>
              <ChatInput />
            </>
          )}
          {channel.type === ChannelType.AUDIO && (
            <MediaRoom chatId={channelId} audio />
          )}
          {channel.type === ChannelType.VIDEO && (
            <MediaRoom chatId={channelId} video />
          )}
        </div>
      </ResizablePanel>
      {!!threadId && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60}>
            <ThreadView />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};
