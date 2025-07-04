import Quill, { Delta, Op, QuillOptions } from "quill";
import React, { RefObject, useEffect, useRef, useState } from "react";

import "quill/dist/quill.snow.css";
import { PiArrowElbowDownLeftThin } from "react-icons/pi";
import { BsArrowReturnLeft, BsShift } from "react-icons/bs";
import { ImageIcon, Plus, SendIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmojiPopover } from "@/components/emoji-popover";
import { MdOutlineAddReaction } from "react-icons/md";
import { Hint } from "@/components/hint";
import { useImperativeFilePicker } from "use-file-picker";
import Image from "next/image";
import { FileUpload } from "./file-upload";

interface EditorProps {
  innerRef?: RefObject<Quill | null>;
  defaultValue?: Delta | Op[];
  onSubmit?: () => void;
}
// Editor is an uncontrolled React component
const Editor = ({ innerRef, defaultValue = [], onSubmit }: EditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultValueRef = useRef(defaultValue);
  const quillRef = useRef<Quill | null>(null);
  const [uploadedImages, setUploadedImage] = useState<Record<number, string>>(
    {}
  );
  const {
    openFilePicker,
    filesContent,
    loading,
    errors,
    plainFiles,
    clear,
    removeFileByIndex,
  } = useImperativeFilePicker({
    readAs: "DataURL",
    multiple: true,
    onFileRemoved: (removedFile, removedIndex) => {
      // this callback is called when a file is removed from the list of selected files
      console.log("onFileRemoved", removedFile, removedIndex);
    },
  });

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
                const text = quill.getText();
                // const addedImage = image;
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
      <div className="flex flex-wrap gap-2 py-2">
        {filesContent.map((file, index) => {
          console.log("path", file.path);
          return (
            <FileUpload
              key={file.path}
              file={plainFiles[index]}
              fileName={file.name}
              fileContent={file.content}
              onRemove={() => removeFileByIndex(index)}
              url={uploadedImages[index]}
              onClientUploadComplete={(url) => {
                setUploadedImage((old) => ({ ...old, [index]: url }));
              }}
            />
          );
        })}
      </div>
      <div className="relative">
        <div ref={containerRef}></div>
        <Hint label="Gửi tin nhắn">
          <Button
            variant="outline"
            size="icon"
            className="absolute right-1 bottom-1 rounded-xs"
          >
            <SendIcon />
          </Button>
        </Hint>
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="flex gap-2">
          <EmojiPopover hint="Thêm trạng thái">
            <Button variant="outline" size="icon" className="rounded-full">
              <MdOutlineAddReaction className="size-5" />
            </Button>
          </EmojiPopover>
          <Hint label="Thêm hình ảnh">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={openFilePicker}
            >
              <ImageIcon />
            </Button>
          </Hint>
        </div>
        <div className="text-muted-foreground text-sm text-right select-none">
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
    </div>
  );
};
Editor.displayName = "Editor";

export default Editor;
