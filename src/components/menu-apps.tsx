"use client";
import { Dot, Grip } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import Link from "next/link";
import Image from "next/image";

export const MenuApps = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Grip />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid grid-cols-2 justify-center gap-2">
          <Link
            href={`/jira`}
            className="flex flex-col justify-between items-center gap-2 p-2 border rounded-sm text-sm text-center"
          >
            <Image
              src="/atlassian_jira_logo_icon_170511.svg"
              alt="logo"
              width={55}
              height={55}
            />
            <span className="">Quản lý dự án</span>
          </Link>
          <Link
            href={`/canvas`}
            className="flex flex-col justify-between items-center gap-2 p-2 border rounded-sm text-sm text-center"
          >
            <Image
              src="/figma-logo-22789.svg"
              alt="logo"
              width={55}
              height={55}
            />
            <span>Tạo file thiết kế</span>
          </Link>
          <Link
            href={`/chats`}
            className="flex flex-col justify-between items-center gap-2 p-2 border rounded-sm text-sm text-center"
          >
            <Image src="/chats.svg" alt="logo" width={55} height={55} />
            <span>Trò chuyện</span>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
