import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Message as MessageType } from "../../types";
import { Message } from "./message";
interface MessageListProps {
  messages: MessageType[];
  editingId: string | null;
  setEditingId: (messageId: string | null) => void;
}

export const MessageList = ({
  messages,
  editingId,
  setEditingId,
}: MessageListProps) => {
  return (
    <div className="absolute inset-0">
      <ScrollArea className="h-full w-full">
        <div className="flex flex-col-reverse">
          {messages.map((message, index) => {
            const isCompact =
              index < messages.length - 1 &&
              messages[index].memberId == messages[index + 1].memberId;
            return (
              <Message
                {...message}
                key={message.id}
                isAuthor
                setEditingId={setEditingId}
                isEditing={editingId === message.id}
                isCompact={isCompact}
              />
            );
          })}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};
