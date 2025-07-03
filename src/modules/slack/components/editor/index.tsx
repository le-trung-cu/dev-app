import Quill, { Delta, Op, QuillOptions } from "quill";
import React, { RefObject, useEffect, useRef } from "react";

import "quill/dist/quill.snow.css";
import { PiArrowElbowDownLeftThin } from "react-icons/pi";
import { BsArrowReturnLeft, BsShift } from "react-icons/bs";
import { Plus } from "lucide-react";

interface EditorProps {
  innerRef?: RefObject<Quill | null>;
  defaultValue?: Delta | Op[];
}
// Editor is an uncontrolled React component
const Editor = ({ innerRef, defaultValue = [] }: EditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultValueRef = useRef(defaultValue);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const container = containerRef.current!;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div")
    );
    const options: QuillOptions = {
      theme: "snow",
      placeholder: "nhập nội dung...",
      modules: {
        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              handler: () => {
                //TODO send message
                console.log("send message");
              },
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, "\n");
              },
            },
          },
        },
      },
    };
    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();

    if (innerRef) {
      innerRef.current = quill;
    }

    if (defaultValueRef.current) {
      quill.setContents(defaultValueRef.current);
    }

    return () => {
      if (innerRef) {
        innerRef.current = null;
      }
      container.innerHTML = "";
    };
  }, [innerRef]);

  return (
    <div>
      <div ref={containerRef}></div>
      <div className="text-muted-foreground text-sm text-right select-none pt-2 ">
        Nhấn{" "}
        <span className="inline-flex items-baseline gap-1">
          <BsShift /> Shift
        </span>
        <Plus className="inline-block size-4 mx-2" />
        <span className="inline-flex items-baseline gap-1">
          <BsArrowReturnLeft />
          Enter
        </span>{" "}
        để xuống dòng
      </div>
    </div>
  );
};
Editor.displayName = "Editor";

export default Editor;
