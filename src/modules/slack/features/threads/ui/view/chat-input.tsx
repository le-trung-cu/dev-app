"use client";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { useCreateMessage } from "@/modules/slack/features/messages/api/use-create-message";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useCallback, useRef } from "react";
import { useChannelId } from "../../../channels/hooks/use-channelId";
import { useThreadId } from "../../hooks/use-thread-id";

const Editor = dynamic(() => import("@/modules/slack/components/editor"), {
  ssr: false,
});

export const ChatInput = () => {
  // Use a ref to access the quill instance directly
  const quillRef = useRef<Quill>(null);
  const workspaceId = useWorkspaceId();
  const [threadId] = useThreadId();
  const channelId = useChannelId();

  const { mutate, isPending } = useCreateMessage();

  const onSubmit = useCallback(
    async ({
      content,
      fileUrl,
    }: {
      content: string;
      fileUrl: string | undefined;
    }) => {
      mutate({ query: { workspaceId, channelId, parentMessageId: threadId }, form: { content, fileUrl } });
      quillRef.current?.setContents([]);
      setTimeout(() => {
        quillRef.current?.focus();
      }, 200);
    },
    [workspaceId, channelId]
  );
  return (
    <Editor innerRef={quillRef} onSubmit={onSubmit} disabled={isPending} />
  );
};
