import { Button } from "@/components/ui/button";
import { MessagesSquareIcon, XIcon } from "lucide-react";
import { useThreadId } from "../../hooks/use-thread-id";

export const Header = () => {
  const [_,setThreadId] = useThreadId();
  return (
    <div className="bg-white border-b h-[49px] flex items-center justify-end gap-5 px-4 overflow-hidden">
      <h1 className="flex gap-2 items-center text-2xl font-bold">
        <MessagesSquareIcon className="flex-shrink-0 size-5 text-zinc-500 dark:text-zinc-400" />{" "}
        Thread
      </h1>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full text-zinc-500 dark:text-zinc-400"
        onClick={() => setThreadId(null)}
      >
        <XIcon />
      </Button>
    </div>
  );
};
