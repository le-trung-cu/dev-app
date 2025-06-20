import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Circle,
  CopyIcon,
  HandIcon,
  ImageIcon,
  MousePointer2,
  MoveUpRight,
  Redo2,
  Settings,
  Slash,
  SquareIcon,
  Star,
  Trash,
  TypeIcon,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { BsTriangle } from "react-icons/bs";
import { Editor } from "../../hooks/use-editor";

interface Props {
  editor?: Editor | null;
  onOpenSidebarImages: () => void;
  setOpenSidebarSettings: () => void;
}
export const Toolbar = ({
  editor,
  onOpenSidebarImages,
  setOpenSidebarSettings,
}: Props) => {
  return (
    <aside className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center bg-gray-800 text-white rounded-md p-1">
      <Button variant="ghost" size="icon">
        <MousePointer2 className="size-6" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-0 px-0 hover:bg-gray-600 hover:text-white mr-2"
          >
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup>
            <DropdownMenuRadioItem value="">
              <MousePointer2 className="size-4" /> Move
              <DropdownMenuShortcut>V</DropdownMenuShortcut>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="">
              <HandIcon className="size-4" /> Hand tool
              <DropdownMenuShortcut>H</DropdownMenuShortcut>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          console.log("XXX", editor);
          editor?.addRectangle();
        }}
      >
        <SquareIcon className="size-6" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-0 px-0 hover:bg-gray-600 hover:text-white mr-2"
          >
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup>
            <DropdownMenuRadioItem
              value=""
              onClick={() => editor?.addRectangle()}
            >
              <SquareIcon className="size-4" /> Rectangle
              <DropdownMenuShortcut>V</DropdownMenuShortcut>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="">
              <Slash className="size-4" /> Line
              <DropdownMenuShortcut>V</DropdownMenuShortcut>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="">
              <MoveUpRight className="size-4" /> Arrow
              <DropdownMenuShortcut>H</DropdownMenuShortcut>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="" onClick={() => editor?.addCircle()}>
              <Circle className="size-4" /> Ellipse
              <DropdownMenuShortcut>H</DropdownMenuShortcut>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value=""
              onClick={() => editor?.addPolygon()}
            >
              <BsTriangle className="size-4" /> Polygon
              <DropdownMenuShortcut>H</DropdownMenuShortcut>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="">
              <Star className="size-4" /> Star
              <DropdownMenuShortcut>H</DropdownMenuShortcut>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="icon">
        <TypeIcon className="size-6" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onOpenSidebarImages}>
        <ImageIcon className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          editor?.copy();
          editor?.paste();
        }}
      >
        <CopyIcon className="size-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={editor?.zoomIn}>
        <ZoomIn className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={editor?.zoomOut}>
        <ZoomOut className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={editor?.delete}>
        <Trash className="size-4" />
      </Button>
      <Button disabled={!editor?.history.canUndo}  variant="ghost" size="icon" onClick={editor?.history.undo}>
        <Undo2 className="size-4" />
      </Button>
      <Button disabled={!editor?.history.canRedo} variant="ghost" size="icon" onClick={editor?.history.redo}>
        <Redo2 className="size-4" />
      </Button>
      <Button  variant="ghost" size="icon" onClick={() => setOpenSidebarSettings()}>
        <Settings className="size-4" />
      </Button>
    </aside>
  );
};
