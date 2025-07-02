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
  Loader,
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
import { BsCloudCheck, BsCloudSlash, BsTriangle } from "react-icons/bs";
import { Editor } from "../../hooks/use-editor";
import { Separator } from "@/components/ui/separator";
import { useMutationState } from "@tanstack/react-query";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/modules/jira/features/tasks/hooks/use-project-id";

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
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const data = useMutationState({
    filters: {
      mutationKey: ["project", workspaceId, projectId],
      exact: true,
    },
    select: (mutation) => mutation.state.status,
  });

  const currentStatus = data[data.length - 1];

  const isError = currentStatus === "error";
  const isPending = currentStatus === "pending";

  return (
    <aside className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center">
      <div className="flex items-center bg-gray-800 text-white rounded-md p-1">
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
              <DropdownMenuRadioItem
                value=""
                onClick={() => editor?.addCircle()}
              >
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
        <Button variant="ghost" size="icon" onClick={() => editor?.addText()}>
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
        <Button
          disabled={!editor?.history.canUndo}
          variant="ghost"
          size="icon"
          onClick={editor?.history.undo}
        >
          <Undo2 className="size-4" />
        </Button>
        <Button
          disabled={!editor?.history.canRedo}
          variant="ghost"
          size="icon"
          onClick={editor?.history.redo}
        >
          <Redo2 className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpenSidebarSettings()}
        >
          <Settings className="size-4" />
        </Button>
        <Separator orientation="vertical" className="h-[20px] mx-2" />
        <div className="flex items-center gap-2 px-3">
          {isPending && (
            <div className="flex items-center gap-x-2">
              <Loader className="size-4 animate-spin text-muted-foreground" />
              <div className="text-xs text-muted-foreground">Saving...</div>
            </div>
          )}
          {!isPending && isError && (
            <div className="flex items-center gap-x-2">
              <BsCloudSlash className="size-[20px] text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                Failed to save
              </div>
            </div>
          )}
          {!isPending && !isError && (
            <div className="flex items-center gap-x-2">
              <BsCloudCheck className="size-[20px] text-muted-foreground" />
              <div className="text-xs text-muted-foreground">Saved</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
