import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn, rgbaObjectToString, stringToRGBObject } from "@/lib/utils";
import { Bold, Italic, PinIcon, Strikethrough, Underline } from "lucide-react";
import { useState } from "react";
import { ChromePicker } from "react-color";
import { Editor } from "../../hooks/use-editor";
import { MdLineWeight } from "react-icons/md";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fonts } from "../../types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Props {
  editor: Editor;
  open: boolean;
  selectedObjects?: fabric.Object[];
  onOpenChange: (open: boolean) => void;
}
export const SidebarProperties = ({ editor, open, onOpenChange }: Props) => {
  const selectedObjects = editor.useWatch("selectedObjects");
  const top = editor.useWatch("top");
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
        <TextBoxInput editor={editor} />
        <FontFamily editor={editor} />
        <FontStyles editor={editor} />
        <FontWeight editor={editor} />
        <FontSize editor={editor} />
        <FillInput editor={editor} />
        <StrokeInput editor={editor} />
        {top && (
          <>
            <Separator className="my-2" />
            <div className="px-2 space-y-2">
              <div>
                <h6 className="font-semibold text-sm text-gray-700">Top</h6>
              </div>
              <div className="">
                <h6 className=" text-xs text-gray-700">weight</h6>
                <div className="flex border border-gray-300 h-[26px] rounded-sm items-center overflow-clip">
                  <MdLineWeight className="size-6" />
                  <Input
                    className="border-none px-0 w-full h-full focus-visible:border-none focus-visible:ring-0 text-left"
                    type="number"
                    value={top}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value)) {
                        editor.changeStrokeWidth(0);
                      } else {
                        editor.changeStrokeWidth(value);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const TextBoxInput = ({ editor }: { editor: Editor }) => {
  const text = editor.useWatch("text");
  if (text === undefined) return null;
  return (
    <div>
      <Separator className="my-2" />
      <div className="px-2">
        <h6 className="font-semibold text-sm text-gray-700">Text</h6>
        <Textarea
          value={text}
          onChange={(e) => editor.changeText(e.target.value)}
        />
      </div>
    </div>
  );
};

const FontFamily = ({ editor }: { editor: Editor }) => {
  const fontFamily = editor.useWatch("fontFamily");
  const objectType = editor.useWatch("objectType");
  if (objectType !== "textbox") return null;

  return (
    <div className="p-2">
      <h6 className="font-semibold text-sm text-gray-700">Font family</h6>
      <Select
        value={fontFamily}
        onValueChange={(value) => editor.changeFontFamily(value)}
      >
        <SelectTrigger className="w-full" style={{ fontFamily }}>
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          {fonts.map((name) => (
            <SelectItem key={name} value={name} style={{ fontFamily: name }}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const FontWeight = ({ editor }: { editor: Editor }) => {
  const fontWeight = editor.useWatch("fontWeight");
  //  bold, normal, 400, 600, 800
  if (fontWeight === undefined) return null;

  return (
    <div className="p-2">
      <h6 className="font-semibold text-sm text-gray-700">Font weight</h6>
      <Select
        value={fontWeight.toString()}
        onValueChange={(value) => editor.changeFontWeight(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="400">normal</SelectItem>
          <SelectItem value="700">bold</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

const FontSize = ({ editor }: { editor: Editor }) => {
  const fontSize = editor.useWatch("fontSize");

  if (fontSize === undefined) return null;

  return (
    <div className="p-2">
      <h6 className="font-semibold text-sm text-gray-700">Font size</h6>
      <div>
        <Input
          type="number"
          value={fontSize}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (isNaN(value)) {
              editor.changeFontSize(1);
            } else {
              editor.changeFontSize(value);
            }
          }}
        />
      </div>
    </div>
  );
};

const FontStyles = ({ editor }: { editor: Editor }) => {
  const fontWeight = editor.useWatch("fontWeight");
  const fontStyle = editor.useWatch("fontStyle");
  const underline = editor.useWatch("underline");
  const linethrough = editor.useWatch("linethrough");
  const objectType = editor.useWatch("objectType");
  if (objectType !== "textbox") return null;

  const values = [];
  if ((fontWeight as number) > 500) {
    values.push("bold");
  }
  if (fontStyle === "italic") {
    values.push("italic");
  }
  if (underline === true) {
    values.push("underline");
  }
  if (linethrough === true) {
    values.push("linethrough");
  }
  return (
    <div className="p-2">
      <h6 className="font-semibold text-sm text-gray-700">Font style</h6>
      <ToggleGroup
        value={values}
        variant="outline"
        type="multiple"
        onValueChange={(values) => {
          console.log({ values, fontWeight });
          if (values.includes("italic")) {
            editor.changeFontStyle("italic");
          } else {
            editor.changeFontStyle("normal");
          }

          if (values.includes("bold") && (fontWeight as number) <= 500) {
            editor.changeFontWeight("700");
          } else if (!values.includes("bold") && (fontWeight as number) > 500) {
            editor.changeFontWeight("400");
          }

          if (values.includes("underline")) {
            editor.changeUnderline(true);
          } else {
            editor.changeUnderline(false);
          }

          if (values.includes("linethrough")) {
            editor.changeLinethrough(true);
          } else {
            editor.changeLinethrough(false);
          }
        }}
      >
        <ToggleGroupItem value="bold" aria-label="Toggle bold">
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Toggle italic">
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Toggle underline">
          <Underline className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="linethrough" aria-label="Toggle linethrough">
          <Strikethrough className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

const FillInput = ({ editor }: { editor: Editor }) => {
  const fillColor = editor.useWatch("fill");
  if (!fillColor) return null;
  return (
    <div>
      <Separator className="my-2" />
      <div className="px-2">
        <h6 className="font-semibold text-sm text-gray-700">Fill</h6>
        <ColorPicker
          color={fillColor}
          onChangeComplete={(color) => {
            editor.changeFillColor(color);
          }}
        />
      </div>
    </div>
  );
};

const StrokeInput = ({ editor }: { editor: Editor }) => {
  const strokeColor = editor.useWatch("stroke");
  const strokeWidth = editor.useWatch("strokeWidth");
  if (!strokeColor || strokeWidth === undefined) return null;

  return (
    <>
      <Separator className="my-2" />
      <div className="px-2 space-y-4">
        <div>
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
        </div>
        <div className="">
          <h6 className=" text-xs text-gray-500 font-semibold">
            Stroke weight
          </h6>
          <div className="flex border border-gray-300 h-[26px] rounded-sm items-center overflow-clip">
            <MdLineWeight className="size-6 mr-2" />
            <Input
              className="border-none px-0 w-full h-full focus-visible:border-none focus-visible:ring-0 text-left"
              type="number"
              value={strokeWidth}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (isNaN(value)) {
                  editor.changeStrokeWidth(0);
                } else {
                  editor.changeStrokeWidth(value);
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
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
