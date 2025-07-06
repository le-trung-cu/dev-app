import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { Header } from "./header";
import { useChannelId } from "../../../channels/hooks/use-channelId";
import { useThreadId } from "../../hooks/use-thread-id";
import { useState } from "react";
import { useGetCurrentMember } from "@/modules/jira/features/members/api/use-get-current-member";
import { Loader, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageList } from "../../../messages/ui/components/message-list";
import { ChatInput } from "./chat-input";
import { useGetMessage } from "../../../messages/api/use-get-message";
import { useGetMessages } from "../../../messages/api/use-get-messages";
import { Message } from "../../../messages/ui/components/message";

export const ThreadView = () => {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const [threadId] = useThreadId();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: currentMember, isLoading: isLoadingMember } =
    useGetCurrentMember({ workspaceId });

  const { data: parentMessage, isLoading: isLoadingParent } = useGetMessage({
    param: { workspaceId, messageId: threadId },
  });

  const {
    data: pages,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingMessages,
  } = useGetMessages({
    param: { workspaceId },
    query: { channelId, parentMessageId: threadId },
  });

  const messages = pages?.pages.flatMap((page) => page.messages) ?? [];

  if (isLoadingMessages || isLoadingMember || isLoadingParent) {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader className="animate-spin size-5 text-muted-foreground" />
      </div>
    );
  }

  if (!parentMessage) {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <TriangleAlert className="size-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Message not found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex justify-center">
        {hasNextPage && (
          <Button onClick={() => fetchNextPage()}>load more</Button>
        )}
      </div>
      <div className="flex-1 pl-5">
        <div className="pl-5 relative w-full h-full">
          <MessageList
            messages={messages}
            editingId={editingId}
            setEditingId={setEditingId}
            memberId={currentMember?.id}
            parentMessage={parentMessage}
          />
        </div>
      </div>
      <div className="pl-5">
        <ChatInput />
      </div>
    </div>
  );
};
