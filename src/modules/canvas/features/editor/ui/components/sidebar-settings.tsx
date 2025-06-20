import { Input } from "@/components/ui/input";
import { cn, rgbaObjectToString } from "@/lib/utils";
import { FormEvent, useMemo, useState } from "react";
import { Editor } from "../../hooks/use-editor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {SketchPicker} from "react-color";
import { XIcon } from "lucide-react";

interface Props {
  editor: Editor;
  open: boolean;
  selectedObjects?: fabric.Object[];
  onOpenChange: (open: boolean) => void;
}
export const SidebarSettings = ({ editor, open, onOpenChange }: Props) => {
  const workspace = editor?.getWorkspace();
  
  const initialWidth = useMemo(() => `${workspace?.width ?? 0}`, [workspace]);
  const initialHeight = useMemo(() => `${workspace?.height ?? 0}`, [workspace]);
  const background = editor.useWatch("background");

  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const onSizeSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    editor?.changeSize({
      width: parseInt(width, 10),
      height: parseInt(height, 10),
    });
  }

  return (
    <div
      className={cn(
        "w-[400px] bg-white flex flex-col h-full translate-x-full transition-transform duration-300 shrink-0 relative z-50",
        { "translate-x-0": open }
      )}
    >
      <div className="relative p-2 flex justify-between items-start">
        <XIcon className="absolute top-2 right-2 size-4 text-gray-600" onClick={() => onOpenChange(false)}/>
        <div>
          <div className="font-semibold text-gray-900 text-sm">Cài đặt</div>
          <div className="text-xs text-muted-foreground">
            Thay đổi thuộc tính khung hình
          </div>
        </div>
      </div>
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <ScrollArea>
            <div className="px-2">
              <form className="space-y-5" onSubmit={onSizeSubmit}>
                <div>
                  <label className="text-sm mb-1 inline-block">Height</label>
                  <Input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 inline-block">Width</label>
                  <Input
                    type="text"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">Đặt kích thước khung hình</Button>
              </form>
              <SketchPicker color={background ?? "#ffffff"} onChange={(color) => editor.changeBackground(rgbaObjectToString(color.rgb))} className="mt-5 border-none shadow-none"  width="auto"/>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
