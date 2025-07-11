"use client";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { useCreateMessage } from "@/modules/slack/features/messages/api/use-create-message";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useCallback, useRef } from "react";
import { useChannelId } from "../../../channels/hooks/use-channel-id";
import { useThreadId } from "../../hooks/use-thread-id";

const Editor = dynamic(() => import("@/modules/slack/components/editor"), {
  ssr: false,
});

export const ChatInput = () => {
  // Use a ref to access the quill instance directly
  const quillRef = useRef<Quill>(null);
  const editorRef = useRef<{ clear: () => void; focus: () => void }>(null);
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
      mutate({
        query: { workspaceId, channelId, parentMessageId: threadId },
        form: { content, fileUrl },
      });
      editorRef.current?.clear();
      setTimeout(() => {
        editorRef.current?.focus();
      }, 200);
    },
    [workspaceId, channelId]
  );
  return (
    <Editor
      editorRef={editorRef}
      innerRef={quillRef}
      onSubmit={onSubmit}
      disabled={isPending}
    />
  );
};
