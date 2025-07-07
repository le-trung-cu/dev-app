import { EmojiPopover } from "@/components/emoji-popover";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn, formatFullTime } from "@/lib/utils";
import { MemberAvatar } from "@/modules/jira/features/members/ui/components/member-avatar";
import {
  DotIcon,
  MessageSquareTextIcon,
  MessagesSquareIcon,
  Pencil,
  SmilePlusIcon,
  Trash2,
} from "lucide-react";
import { RefObject, useMemo, useRef, useState } from "react";
import { Message as MessageType } from "../../types";
import dynamic from "next/dynamic";
import { useUpdateMessage } from "../../api/use-update-message";
import { useDeleteMessage } from "../../api/use-delete-message";
import { useConfirm } from "@/hooks/use-confirm";
import { useThreadId } from "../../../threads/hooks/use-thread-id";
import { useUpdateReaction } from "../../api/use-update-reaction";
import { Badge } from "@/components/ui/badge";
import { useGetMembersMap } from "@/modules/jira/features/members/api/use-get-members";
import { formatDistanceToNow } from "date-fns";

const Editor = dynamic(() => import("@/modules/slack/components/editor"), {
  ssr: false,
});

type MessageProps = MessageType & {
  isAuthor?: boolean;
  isCompact?: boolean;
  isOnline?: boolean;
  isEditing?: boolean;
  members?: ReturnType<typeof useGetMembersMap>["data"];
  setEditingId: (messageId: string | null) => void;
};

export const Message = (props: MessageProps) => {
  const { mutate: updateApi } = useUpdateMessage();
  const { mutate: reactionApi } = useUpdateReaction();
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

  const onEmojiSelect = (symbol: string) => {
    reactionApi({
      query: { workspaceId: props.workspaceId, messageId: props.id },
      form: { symbol },
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
          onEmojiSelect={onEmojiSelect}
        />
      ) : (
        <BaseMessage
          {...props}
          isEditing={props.isEditing}
          setEditingId={props.setEditingId}
          onUpdateSubmit={onUpdateSubmit}
          onDeleteSubmit={onDeleteSubmit}
          onEmojiSelect={onEmojiSelect}
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
    onEmojiSelect?: (value: string) => void;
  }
) => {
  const reactions = useTransformReactions(props.reactions);
  const member = props.members?.[props.memberId];
  return (
    <div
      className={cn(
        "flex gap-2 max-w-[min(80%,1000px)] pt-4 pb-0.5 w-full pr-4",
        props.isAuthor && "flex-row-reverse ml-auto",
        props.isEditing && "max-w-full"
      )}
    >
      <MemberAvatar name={member?.name ?? "U"} className="rounded-full mt-2" />
      <div className={cn(props.isEditing && "flex-1")}>
        <div
          className={cn(
            props.isAuthor && "text-right flex flex-row-reverse items-center"
          )}
        >
          <span className="font-semibold text-sm">
            {member?.name ?? "unknow"}
          </span>
          <DotIcon
            className={cn(
              "inline-block size-8 text-muted-foreground/50",
              props.isOnline && "text-green-500",
              props.isAuthor && "size-2 invisible"
            )}
          />
          <Hint label={formatFullTime(new Date(props.createdAt))}>

          <span className="text-muted-foreground text-sm font-light">
            {formatDistanceToNow(props.createdAt, { addSuffix: true })}
          </span>
          </Hint>
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
          <div className={cn("flex flex-col", props.isAuthor && "items-end")}>
            <HoverCard {...(props.deleted ? { open: false } : {})}>
              <HoverCardTrigger asChild>
                <div
                  className={cn(
                    "bg-gray-100 p-3 rounded-xl w-fit",
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
            {props.replies && props.replies.length > 0 ? (
              <div className="gap-1 flex flex-row-reverse items-center flex-wrap">
                {props.replies && props.replies.length > 0 && (
                  <Hint label={`Có ${props.replies.length} tin nhắn trả lời`}>
                    <Badge
                      variant="outline"
                      className="mt-1 [&>svg]:size-5 text-zinc-500 dark:text-zinc-400"
                    >
                      <MessagesSquareIcon className="" />
                      {props.replies.length}
                    </Badge>
                  </Hint>
                )}
                {reactions.map((reaction) => (
                  <Badge
                    key={reaction.symbol}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => props.onEmojiSelect?.(reaction.symbol)}
                  >
                    {reaction.symbol}
                    <span className="text-xs text-muted-foreground">
                      ({reaction.memberIds.length})
                    </span>
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
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
    onEmojiSelect?: (value: string) => void;
  }
) => {
  const reactions = useTransformReactions(props.reactions);

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
          <div className={cn("flex flex-col", props.isAuthor && "items-end")}>
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
            {reactions.length > 0 ||
            (props.replies && props.replies.length > 0) ? (
              <div className="gap-1 flex flex-row-reverse items-center flex-wrap">
                {props.replies && props.replies.length > 0 && (
                  <Hint label={`Có ${props.replies.length} tin nhắn trả lời`}>
                    <Badge
                      variant="outline"
                      className="mt-1 [&>svg]:size-5 text-zinc-500 dark:text-zinc-400"
                    >
                      <MessagesSquareIcon className="" />
                      {props.replies.length}
                    </Badge>
                  </Hint>
                )}
                {reactions.map((reaction) => (
                  <Badge
                    key={reaction.symbol}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => props.onEmojiSelect?.(reaction.symbol)}
                  >
                    {reaction.symbol}
                    <span className="text-xs text-muted-foreground">
                      ({reaction.memberIds.length})
                    </span>
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

const Actions = (
  props: MessageProps & {
    emojiContenRef?: RefObject<HTMLDivElement | null>;
    onDeleteSubmit: () => void;
    onEmojiSelect?: (value: string) => void;
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
          <Button variant="ghost" onClick={() => setThreadId(props.id)}>
            <MessageSquareTextIcon />
          </Button>
        </Hint>
      )}
      <EmojiPopover
        contenRef={props.emojiContenRef}
        hint="Thêm trạng thái"
        onEmojiSelect={props.onEmojiSelect}
      >
        <Button variant="ghost">
          <SmilePlusIcon />
        </Button>
      </EmojiPopover>
    </div>
  );
};

const useTransformReactions = (reactions: MessageProps["reactions"]) => {
  const _reactions = useMemo(() => {
    if (!reactions) return [];
    return Object.keys(reactions)
      .map((symbol) => ({ ...reactions![symbol], symbol }))
      .sort();
  }, [reactions]);

  return _reactions;
};
