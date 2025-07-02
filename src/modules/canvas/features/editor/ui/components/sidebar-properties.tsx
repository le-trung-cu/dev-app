import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn, rgbaObjectToString, stringToRGBObject } from "@/lib/utils";
import {
  AlignCenter,
  AlignJustifyIcon,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  PinIcon,
  Plus,
  PlusCircle,
  Strikethrough,
  Trash2Icon,
  Underline,
  XIcon,
} from "lucide-react";
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
import { filters, fonts } from "../../types";
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
        <DimensionInput editor={editor} />
        <ImageFilter editor={editor} />
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
  const textAlign = editor.useWatch("textAlign") ?? "left";

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
      <div className="flex items-center gap-10">
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
            } else if (
              !values.includes("bold") &&
              (fontWeight as number) > 500
            ) {
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

        <ToggleGroup
          type="single"
          variant="outline"
          value={textAlign}
          onValueChange={(value) => editor.changeTextAlign(value)}
        >
          <ToggleGroupItem value="left" aria-label="Toggle bold">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Toggle italic">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Toggle underline">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="justify" aria-label="Toggle underline">
            <AlignJustifyIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
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

const DimensionInput = ({ editor }: { editor: Editor }) => {
  const width = editor.useWatch("width");
  const height = editor.useWatch("height");
  const scaleX = editor.useWatch("scaleX");
  const scaleY = editor.useWatch("scaleY");
  if (width === undefined) return null;
  return (
    <>
      <Separator className="my-2" />
      <div className="px-2 space-y-2">
        <div>
          <h6 className="font-semibold text-sm text-gray-700">Kích thước</h6>
        </div>
        <div className="flex items-center">
          <div className="">
            <h6 className=" text-xs text-gray-700">Chiều rộng</h6>
            <div className="flex border border-gray-300 h-[26px] rounded-sm items-center overflow-clip">
              <Input
                className="border-none px-0 w-full h-full focus-visible:border-none focus-visible:ring-0 text-left"
                type="number"
                value={width}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (isNaN(value)) {
                    editor.changeWidth(0);
                  } else {
                    editor.changeWidth(value);
                  }
                }}
              />
            </div>
          </div>
          <XIcon className="size-4 text-gray-400 mx-5" />
          <div className="">
            <h6 className=" text-xs text-gray-700">Chiều cao</h6>
            <div className="flex border border-gray-300 h-[26px] rounded-sm items-center overflow-clip">
              <Input
                className="border-none px-0 w-full h-full focus-visible:border-none focus-visible:ring-0 text-left"
                type="number"
                value={height}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (isNaN(value)) {
                    editor.changeHeight(0);
                  } else {
                    editor.changeHeight(value);
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div>
          <h6 className="font-semibold text-sm text-gray-700">Scale</h6>
        </div>
        <div className="flex items-center">
          <div className="">
            <h6 className=" text-xs text-gray-700">Scale-X</h6>
            <div className="flex border border-gray-300 h-[26px] rounded-sm items-center overflow-clip">
              <Input
                className="border-none px-0 w-full h-full focus-visible:border-none focus-visible:ring-0 text-left"
                type="number"
                value={scaleX}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (isNaN(value)) {
                    editor.changeScaleX(0);
                  } else {
                    editor.changeScaleX(value);
                  }
                }}
              />
            </div>
          </div>
          <XIcon className="size-4 text-gray-400 mx-5" />
          <div className="">
            <h6 className=" text-xs text-gray-700">Scale-Y</h6>
            <div className="flex border border-gray-300 h-[26px] rounded-sm items-center overflow-clip">
              <Input
                className="border-none px-0 w-full h-full focus-visible:border-none focus-visible:ring-0 text-left"
                type="number"
                value={scaleY}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (isNaN(value)) {
                    editor.changeScaleY(0);
                  } else {
                    editor.changeScaleY(value);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ImageFilter = ({ editor }: { editor: Editor }) => {
  const currentFilters = editor.useWatch("filters");
  const objectType = editor.useWatch("objectType");
  if (objectType !== "image") return null;

  return (
    <>
      <Separator className="my-2" />
      <div className="px-2 ">
        <h6 className="font-semibold text-sm text-gray-700">Filters</h6>
        <div className="flex flex-col gap-2">
          {currentFilters?.map((item) => {
            const currentFilter = item as fabric.IBaseFilter & {
              id: string;
              name: string;
            };
            return (
              <div key={currentFilter.id} className="flex items-center gap-4">
                <Select
                  value={currentFilter.name}
                  onValueChange={(value) =>
                    editor.changeFilter(currentFilter.id, value)
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Trash2Icon
                  className="size-4 mr-2"
                  onClick={() => editor.deleteFilter(currentFilter.id)}
                />
              </div>
            );
          })}
          <div className="flex justify-end">
            <Button
              size="icon"
              variant="outline"
              onClick={() => editor.addFilter("none")}
            >
              <PlusCircle />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
