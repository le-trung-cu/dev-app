import { EmojiPopover } from "@/components/emoji-popover";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { MemberAvatar } from "@/modules/jira/features/members/ui/components/member-avatar";
import {
  DotIcon,
  MessageSquareTextIcon,
  Pencil,
  SmilePlusIcon,
  Trash2,
} from "lucide-react";
import { RefObject, useRef, useState } from "react";
import { Message as MessageType } from "../../types";
import dynamic from "next/dynamic";
import { useUpdateMessage } from "../../api/use-update-message";
import { useDeleteMessage } from "../../api/use-delete-message";
import { useConfirm } from "@/hooks/use-confirm";
import { useThreadId } from "../../../threads/hooks/use-thread-id";

const Editor = dynamic(() => import("@/modules/slack/components/editor"), {
  ssr: false,
});

type MessageProps = MessageType & {
  isAuthor?: boolean;
  isCompact?: boolean;
  isOnline?: boolean;
  isEditing?: boolean;
  setEditingId: (messageId: string | null) => void;
};

export const Message = (props: MessageProps) => {
  const { mutate: updateApi } = useUpdateMessage();
  const { mutate: deleteApi } = useDeleteMessage();
  const [ConfirmDialog, confirm] = useConfirm();

  const onUpdateSubmit = ({ content }: { content: string }) => {
    updateApi(
      {
        query: {
          workspaceId: props.workspaceId,
          messageId: props.id,
        },
        form: { content },
      },
      {
        onSuccess: () => {
          props.setEditingId(null);
        },
      }
    );
  };

  const onDeleteSubmit = async () => {
    const ok = await confirm({
      title: "Xoá tin nhắn",
      description: "Tin nhắn sẽ bị xoá khỏi cuộc trò chuyện",
    });
    if (!ok) return;

    deleteApi({
      query: { workspaceId: props.workspaceId, messageId: props.id },
    });
  };

  return (
    <>
      <ConfirmDialog />
      {props.isCompact ? (
        <CompactMessage
          {...props}
          isEditing={props.isEditing}
          setEditingId={props.setEditingId}
          onUpdateSubmit={onUpdateSubmit}
          onDeleteSubmit={onDeleteSubmit}
        />
      ) : (
        <BaseMessage
          {...props}
          isEditing={props.isEditing}
          setEditingId={props.setEditingId}
          onUpdateSubmit={onUpdateSubmit}
          onDeleteSubmit={onDeleteSubmit}
        />
      )}
    </>
  );
};

const BaseMessage = (
  props: MessageProps & {
    onEdit?: (edit: boolean) => void;
    onUpdateSubmit: ({ content }: { content: string }) => void;
    onDeleteSubmit: () => void;
  }
) => {
  return (
    <div
      className={cn(
        "flex gap-2 max-w-[min(80%,1000px)] pt-4 pb-0.5 w-full pr-4",
        props.isAuthor && "flex-row-reverse ml-auto",
        props.isEditing && "max-w-full"
      )}
    >
      <MemberAvatar name="A" className="rounded-full mt-2" />
      <div className={cn(props.isEditing && "flex-1")}>
        <div
          className={cn(
            props.isAuthor && "text-right flex flex-row-reverse items-center"
          )}
        >
          <span className="font-semibold text-sm">user name</span>
          <DotIcon
            className={cn(
              "inline-block size-8 text-muted-foreground/50",
              props.isOnline && "text-green-500",
              props.isAuthor && "size-2 invisible"
            )}
          />
          <span className="text-muted-foreground text-sm font-light">
            17 min
          </span>
        </div>
        {props.isEditing ? (
          <Editor
            variant={props.isEditing ? "edit" : "create"}
            defaultValue={
              props.content ? [{ insert: props.content }] : undefined
            }
            onCancelEdit={() => props.setEditingId(null)}
            onSubmit={props.onUpdateSubmit}
          />
        ) : (
          <HoverCard {...(props.deleted ? { open: false } : {})}>
            <HoverCardTrigger asChild>
              <div
                className={cn(
                  "bg-gray-100 p-3 rounded-xl",
                  props.isAuthor ? "rounded-tr-none" : "rounded-tl-none",
                  props.isAuthor && "bg-blue-200/90",
                  props.isEditing && "bg-white",
                  props.deleted && "opacity-55 text-xs"
                )}
              >
                {props.content}
              </div>
            </HoverCardTrigger>
            <HoverCardContent
              align="start"
              side="right"
              sideOffset={-220}
              alignOffset={-100}
              className="p-0.5 flex w-auto"
            >
              <Actions {...props} />
            </HoverCardContent>
          </HoverCard>
        )}
      </div>
    </div>
  );
};

const CompactMessage = (
  props: MessageProps & {
    onEdit?: (edit: boolean) => void;
    onUpdateSubmit: ({ content }: { content: string }) => void;
    onDeleteSubmit: () => void;
  }
) => {
  return (
    <div
      className={cn(
        "flex gap-2 max-w-[min(80%,1000px)] pb-0.5 w-full pr-4",
        props.isAuthor && "flex-row-reverse ml-auto",
        props.isEditing && "max-w-full"
      )}
    >
      <div className="size-9"></div>
      <div className={cn(props.isEditing && "flex-1")}>
        {props.isEditing ? (
          <Editor
            variant={props.isEditing ? "edit" : "create"}
            defaultValue={
              props.content ? [{ insert: props.content }] : undefined
            }
            onCancelEdit={() => props.setEditingId(null)}
            onSubmit={props.onUpdateSubmit}
          />
        ) : (
          <HoverCard {...(props.deleted ? { open: false } : {})}>
            <HoverCardTrigger asChild>
              <div
                className={cn(
                  "bg-gray-100 p-3 rounded-xl",
                  props.isAuthor ? "rounded-tr-none" : "rounded-tl-none",
                  props.isAuthor && "bg-blue-200/90",
                  props.deleted && "opacity-55 text-xs"
                )}
              >
                {props.content}
              </div>
            </HoverCardTrigger>
            <HoverCardContent
              align="start"
              side="right"
              sideOffset={-220}
              alignOffset={-100}
              className="p-0.5 flex w-auto"
            >
              <Actions {...props} />
            </HoverCardContent>
          </HoverCard>
        )}
      </div>
    </div>
  );
};

const Actions = (
  props: MessageProps & {
    emojiContenRef?: RefObject<HTMLDivElement | null>;
    onDeleteSubmit: () => void;
  }
) => {
  const [_, setThreadId] = useThreadId();

  return (
    <div className="flex">
      {props.isAuthor && (
        <Hint label="Chỉnh sửa">
          <Button
            variant="ghost"
            onClick={() => props.setEditingId?.(props.id)}
          >
            <Pencil />
          </Button>
        </Hint>
      )}
      {props.isAuthor && (
        <Hint label="Xoá tin nhắn">
          <Button variant="ghost" onClick={props.onDeleteSubmit}>
            <Trash2 />
          </Button>
        </Hint>
      )}
      {!props.parentMessageId && (
        <Hint label="Trả lời">
          <Button
            variant="ghost"
            onClick={() => setThreadId(props.id)}
          >
            <MessageSquareTextIcon />
          </Button>
        </Hint>
      )}
      <EmojiPopover contenRef={props.emojiContenRef} hint="Thêm trạng thái">
        <Button variant="ghost">
          <SmilePlusIcon />
        </Button>
      </EmojiPopover>
    </div>
  );
};
