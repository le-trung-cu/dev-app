import { Dot, Grip } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import Link from "next/link";

export const MenuApps = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Grip />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div>
          <Link href="/jira" className="inline-flex flex-col items-center">
            <span className="size-10 inline-flex justify-center items-center rounded-sm bg-muted"></span>
            jira
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
