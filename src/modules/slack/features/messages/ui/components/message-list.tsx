import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Message as MessageType } from "../../types";
import { Message } from "./message";
import { useGetMembersMap } from "@/modules/jira/features/members/api/use-get-members";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { useRef } from "react";
import { useChatScroll } from "@/modules/slack/hooks/use-chat-scroll";
import { Button } from "@/components/ui/button";
import { MessageCircleMoreIcon } from "lucide-react";
import { differenceInMinutes } from "date-fns";

const TIME_THRESHOLD = 2;

interface MessageListProps {
  messages: MessageType[];
  parentMessage?: MessageType;
  editingId: string | null;
  memberId?: string;
  setEditingId: (messageId: string | null) => void;
  shouldLoadMore: boolean;
  loadMore: () => void;
  isFetching: boolean;
}

export const MessageList = ({
  messages,
  parentMessage,
  editingId,
  memberId,
  setEditingId,
  shouldLoadMore,
  loadMore,
  isFetching,
}: MessageListProps) => {
  const workspaceId = useWorkspaceId();
  const chatRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: members, isLoading: isLoadingMembers } = useGetMembersMap({
    workspaceId,
  });

  const { haveNewMessages, scrollToBottom, loadMoreRef } = useChatScroll({
    chatRef,
    bottomRef,
    count: messages.length,
    shouldLoadMore,
    loadMore,
    isFetching,
  });

  return (
    <div className="absolute inset-0">
      <ScrollArea ref={chatRef} className="h-full w-full">
        <div className="flex flex-col-reverse">
          {messages.map((message, index) => {
            // const prevMessage = index < messages.length - 1? undefined : messages[index + 1];
            // const isCompact =
            //   prevMessage &&
            //   prevMessage.memberId === message.memberId &&
            //   differenceInMinutes(
            //     new Date(prevMessage.createdAt),
            //     new Date(message.createdAt)
            //   ) < TIME_THRESHOLD;
            const prevMessage = messages[index + 1];
            const isCompact =
              prevMessage &&
              message.memberId === prevMessage.memberId &&
              differenceInMinutes(
                new Date(message.createdAt),
                new Date(prevMessage.createdAt)
              ) < TIME_THRESHOLD;

            return (
              <Message
                {...message}
                key={message.id}
                isAuthor={memberId === message.memberId}
                setEditingId={setEditingId}
                isEditing={editingId === message.id}
                isCompact={isCompact}
                members={members}
              />
            );
          })}
          {!!parentMessage && !!parentMessage && (
            <Message
              {...parentMessage}
              key={parentMessage.id}
              isAuthor={memberId === parentMessage.memberId}
              setEditingId={setEditingId}
              isEditing={editingId === parentMessage.id}
              members={members}
            />
          )}
          <div ref={loadMoreRef} className="h-1"></div>
        </div>
        <div ref={bottomRef} className="h-1"></div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      {haveNewMessages && (
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-5 right-5 z-50 rounded-full cursor-pointer"
          onClick={scrollToBottom}
        >
          <MessageCircleMoreIcon />
        </Button>
      )}
    </div>
  );
};
