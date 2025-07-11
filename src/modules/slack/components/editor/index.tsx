import Quill, { Delta, Op, QuillOptions } from "quill";
import React, {
  RefObject,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import "quill/dist/quill.snow.css";
import { BsArrowReturnLeft, BsShift } from "react-icons/bs";
import { ImageIcon, Plus, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmojiPopover } from "@/components/emoji-popover";
import { MdOutlineAddReaction } from "react-icons/md";
import { Hint } from "@/components/hint";
import { useImperativeFilePicker } from "use-file-picker";
import { FileUpload } from "./file-upload";

interface EditorValue {
  content: string;
  fileUrl: string | undefined;
}

interface EditorProps {
  variant?: "create" | "edit";
  editorRef?: RefObject<{
    clear: () => void;
    focus: () => void;
  } | null>;
  innerRef?: RefObject<Quill | null>;
  defaultValue?: Delta | Op[];
  disabled?: boolean;
  onSubmit?: (
    value: EditorValue,
    options?: {
      onSuccess?: () => void;
    }
  ) => void;
  onCancelEdit?: () => void;
}
// Editor is an uncontrolled React component
const Editor = ({
  variant = "create",
  editorRef,
  innerRef,
  defaultValue = [],
  disabled = false,
  onSubmit,
  onCancelEdit,
}: EditorProps) => {
  const [text, setText] = useState("");

  const submitRef = useRef(onSubmit);
  const [openEmoji, setOpenEmoji] = useState(false);

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
    multiple: false,
    onFileRemoved: (removedFile, removedIndex) => {
      // this callback is called when a file is removed from the list of selected files
      console.log("onFileRemoved", removedFile, removedIndex);
    },
  });

  useImperativeHandle(editorRef, () => {
    return {
      ...innerRef?.current,
      clear() {
        quillRef.current?.setContents([]);
        clear();
      },
      focus() {
        quillRef.current?.focus();
      },
    };
  }, []);

  const imagesRef = useRef<string[]>([]);

  imagesRef.current = filesContent?.map((item, index) => uploadedImages[index]);

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    defaultValueRef.current = defaultValue;
    if (disabled && quillRef.current?.isEnabled()) {
      quillRef.current.disable();
    } else if (!disabled && !quillRef.current?.isEnabled) {
      quillRef.current?.enable();
    }
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
                const text = quill.getText();
                const fileUrl =
                  imagesRef.current.length > 0
                    ? imagesRef.current.join("\n")
                    : undefined;
                const isEmpty =
                  !fileUrl &&
                  text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

                if (isEmpty) return;
                const content = JSON.stringify(quill.getContents());
                submitRef.current?.({ content, fileUrl });
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

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());
    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if (container) {
        container.innerHTML = "";
      }
      if (quillRef.current) {
        quillRef.current = null;
      }
      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, [innerRef]);

  useEffect(() => {
    if (disabled) {
      quillRef.current?.disable();
    } else {
      quillRef.current?.enable();
    }
  }, [disabled]);

  const onEmojiSelect = (emoji: string) => {
    const quill = quillRef.current;
    quill?.insertText(quill?.getSelection(true)?.index || 0, emoji, "user");
    quill?.setSelection({index: (quill?.getSelection(true)?.index || 0)  + emoji.length, length: 0});
    setOpenEmoji(true);
  };

  const onSubmitHandler = () => {
    if (!quillRef.current || !onSubmit) return;
    const text = quillRef.current.getText();
    const fileUrl =
      imagesRef.current.length > 0 ? imagesRef.current.join("\n") : undefined;
    const isEmpty =
      !fileUrl && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

    if (isEmpty) return;
    const content = JSON.stringify(quillRef.current.getContents());
    onSubmit({ content, fileUrl });
  };

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
            disabled={disabled}
            variant="outline"
            size="icon"
            className="absolute right-1 bottom-1 rounded-xs"
            onClick={onSubmitHandler}
          >
            <SendIcon />
          </Button>
        </Hint>
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="flex gap-2">
          <EmojiPopover
            hint="Thêm trạng thái"
            open={openEmoji}
            onOpenChange={setOpenEmoji}
            onEmojiSelect={onEmojiSelect}
          >
            <Button
              disabled={disabled}
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              <MdOutlineAddReaction className="size-5" />
            </Button>
          </EmojiPopover>
          {variant === "create" && (
            <Hint label="Thêm hình ảnh">
              <Button
                disabled={disabled}
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={openFilePicker}
              >
                <ImageIcon />
              </Button>
            </Hint>
          )}
        </div>
        {variant === "create" && (
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
        )}
        {variant === "edit" && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={onCancelEdit}
            >
              Huỷ
            </Button>
            <Button
              variant="outline"
              className="rounded-full bg-blue-500 text-gray-200"
              onClick={onSubmitHandler}
            >
              Cập nhật
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
Editor.displayName = "Editor";

export default Editor;
