"use client";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef } from "react";

const Editor = dynamic(() => import("@/modules/slack/components/editor"), {
  ssr: false,
});

export const ChatInput = () => {
  // Use a ref to access the quill instance directly
  const quillRef = useRef<Quill>(null);

  return <Editor innerRef={quillRef} />;
};
