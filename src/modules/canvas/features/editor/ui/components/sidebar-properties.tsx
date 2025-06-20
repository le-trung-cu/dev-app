import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn, rgbaObjectToString, stringToRGBObject } from "@/lib/utils";
import { PinIcon } from "lucide-react";
import { useState } from "react";
import { ChromePicker } from "react-color";
import { Editor } from "../../hooks/use-editor";
import { MdLineWeight } from "react-icons/md";

interface Props {
  editor: Editor;
  open: boolean;
  selectedObjects?: fabric.Object[];
  onOpenChange: (open: boolean) => void;
}
export const SidebarProperties = ({ editor, open, onOpenChange }: Props) => {
  const [r, rerender] = useState("");
  // const fillColor = editor.getActiveFillColor();
  const strokeColor = editor.useWatch("stroke");
  const fillColor = editor.useWatch("fill");
  return (
    <div
      className={cn(
        "w-[400px] bg-white h-full translate-x-full transition-transform duration-300 shrink-0",
        { "translate-x-0": open }
      )}
    >
      <div>
        <div className="p-2 flex justify-between items-start">
          <div>
            <div className="font-semibold text-gray-900 text-sm">
              Chỉnh sửa thuộc tính
            </div>
            <div className="text-xs text-muted-foreground">
              Chọn đối tượng trên canvas để sửa đổi
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <PinIcon />
          </Button>
        </div>
        {fillColor && (
          <>
            <Separator className="my-2" />
            <div className="px-2">
              <h6 className="font-semibold text-sm text-gray-700">Fill</h6>
              <ColorPicker
                color={fillColor}
                onChangeComplete={(color) => {
                  editor.changeFillColor(color);
                  // setTimeout(() => {
                  //   rerender(color);
                  // }, 200);
                }}
              />
            </div>
          </>
        )}
        {strokeColor && (
          <>
            <Separator className="my-2" />
            <div className="px-2">
              <h6 className="font-semibold text-sm text-gray-700">Stroke</h6>
              <ColorPicker
                color={strokeColor}
                onChangeComplete={(color) => {
                  editor.changeStrokeColor(color);
                  // setTimeout(() => {
                  //   rerender(color);
                  // }, 200);
                }}
              />
              <div className="">
                <h6 className=" text-xs text-gray-700">weight</h6>
                <div className="flex border border-gray-300 h-[26px] rounded-sm items-center overflow-clip">
                  <MdLineWeight />
                  <Input className="border-none text-center px-0 h-full focus-visible:border-none focus-visible:ring-0 w-[30px]" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ColorPicker = ({
  color,
  onChangeComplete,
}: {
  color: string;
  onChangeComplete: (color: string) => void;
}) => {
  const rgb = stringToRGBObject(color);

  return (
    <div className="flex border border-gray-300 h-[26px] rounded-sm items-center overflow-clip">
      <Popover>
        <PopoverTrigger asChild>
          <div
            className="h-full aspect-square"
            style={{
              backgroundColor: color,
            }}
          ></div>
        </PopoverTrigger>
        <PopoverContent
          side="left"
          className="border-none shadow-none p-0 w-fit"
        >
          <ChromePicker
            color={color}
            onChangeComplete={(color) =>
              onChangeComplete(rgbaObjectToString(color.rgb))
            }
            disableAlpha={false}
          />
        </PopoverContent>
      </Popover>
      <Input
        readOnly
        className="border-none h-full focus-visible:border-none focus-visible:ring-0"
        value={color}
      />
      <div className="flex h-full bg-gray-300/20 items-center">
        <Input
          readOnly
          value={rgb?.a ? rgb.a * 100 : 1}
          className="border-none text-center px-0 h-full focus-visible:border-none focus-visible:ring-0 w-[30px]"
        />
        <div className="pr-2 text-xs font-semibold">%</div>
      </div>
    </div>
  );
};
