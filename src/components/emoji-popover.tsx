import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import EmojiPicker from "emoji-picker-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { RefObject } from "react";

interface EmojiPopoverProps {
  children: React.ReactNode;
  hint?: string;
  onEmojiSelect?: (value: string) => void;
  contenRef?: RefObject<HTMLDivElement | null>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const EmojiPopover = ({
  children,
  hint = "Emoji",
  onEmojiSelect,
  contenRef,
  open,
  onOpenChange,
}: EmojiPopoverProps) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent>
          <p className="font-medium text-xs">{hint}</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        side="left"
        align="end"
        alignOffset={100}
        ref={contenRef}
        className="p-0 w-full border-none shadow-none"
      >
        <EmojiPicker onEmojiClick={(v) => onEmojiSelect?.(v.emoji)} />
      </PopoverContent>
    </Popover>
  );
};
