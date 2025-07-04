"use client";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { useCreateMessage } from "@/modules/slack/features/messages/api/use-create-message";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useCallback, useRef } from "react";
import { useChannelId } from "../../../hooks/use-channelId";

const Editor = dynamic(() => import("@/modules/slack/components/editor"), {
  ssr: false,
});

export const ChatInput = () => {
  // Use a ref to access the quill instance directly
  const quillRef = useRef<Quill>(null);
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();

  const { mutate, isPending } = useCreateMessage();

  const onSubmit = useCallback(
    ({
      content,
      fileUrl,
    }: {
      content: string;
      fileUrl: string | undefined;
    }) => {
      mutate(
        { param: { workspaceId }, form: { content, fileUrl, channelId } },
        {
          onSuccess: () => {
            quillRef.current?.setContents([]);
            setTimeout(() => {
              quillRef.current?.focus();
            }, 200);
          },
        }
      );
    },
    [mutate, workspaceId, channelId]
  );

  return (
    <Editor innerRef={quillRef} onSubmit={onSubmit} disabled={isPending} />
  );
};
