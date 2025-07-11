import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Message as MessageType } from "../../types";
import { Message } from "./message";
import { useGetMembersMap } from "@/modules/jira/features/members/api/use-get-members";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { useMemo, useRef } from "react";
import { useChatScroll } from "@/modules/slack/hooks/use-chat-scroll";
import { Button } from "@/components/ui/button";
import { MessageCircleMoreIcon } from "lucide-react";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";

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
const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Hôm nay";
  if (isYesterday(date)) return "Hôm qua";
  return format(date, "EEEE, MMMM d");
};
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

  const groupedMessages = useMemo(() => {
    return messages?.reduce(
      (groups, message) => {
        const date = new Date(message.createdAt);
        const dateKey = format(date, "yyyy-MM-dd");
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].unshift(message);
        return groups;
      },
      {} as Record<string, typeof messages>
    );
  }, [messages]);

  return (
    <div className="absolute inset-0">
      <ScrollArea viewPortRef={chatRef} className="h-full w-full">
        <div className="flex flex-col-reverse">
          {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
            <div key={dateKey}>
              <div className="text-center my-2 relative">
                <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                  {formatDateLabel(dateKey)}
                </span>
              </div>

              {messages.map((message, index) => {
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
            </div>
          ))}

          {!!parentMessage && (
            <Message
              {...parentMessage}
              key={parentMessage.id}
              isAuthor={memberId === parentMessage.memberId}
              setEditingId={setEditingId}
              isEditing={editingId === parentMessage.id}
              members={members}
            />
          )}
          <div className="flex justify-center py-5">
            <div
              ref={loadMoreRef}
              className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm"
              onClick={() => {
                console.log({shouldLoadMore})
                if(shouldLoadMore && loadMore) {
                  loadMore();
                }
              }}
            >
              {isFetching? "Đang tải..." : shouldLoadMore ? "Xem thêm" : "Không còn thêm"}
            </div>
          </div>
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
