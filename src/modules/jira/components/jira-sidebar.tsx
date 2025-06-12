"use client";

import * as React from "react";
import {
  ArchiveX,
  Command,
  File,
  HomeIcon,
  Inbox,
  Notebook,
  PencilLine,
  Plus,
  Send,
  Settings,
  Trash2,
  Users2,
} from "lucide-react";

import { NavUser } from "@/modules/jira/components/nav-user";
import { Label } from "@/components/ui/label";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { WorkspaceSwitcher } from "../features/workspaces/ui/components/workspace-switcher";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { WorkspaceAvatar } from "../features/workspaces/ui/components/workspace-avatar";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Workspace } from "@/generated/prisma-jira-database/jira-database-client-types";

const menus = [
  {
    icon: HomeIcon,
    title: "Home",
    href: "",
  },
  { icon: Notebook, title: "My tasks", href: "my-task" },
  {
    icon: Settings,
    title: "Cài đặt",
    href: "settings",
  },
  {
    icon: Users2,
    title: "Thành viên",
    href: "members",
  },
];
export const JiraSidebar = ({
  workspace,
}: {
  workspace: Workspace;
  workspaces: Workspace[];
}) => {
  return (
    <div>
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">{workspace.name}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Workspace</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Button asChild variant="ghost" className="flex w-full">
                    <Link href={`/jira/workspaces/${workspace.id}/settings`}>
                      <PencilLine /> chỉnh sửa
                    </Link>
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="text-foreground text-base font-medium"></div>
          <Label className="flex items-center gap-2 text-sm">
            <span>Unreads</span>
            <Switch className="shadow-none" />
          </Label>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupLabel>Menus</SidebarGroupLabel>
          <SidebarGroupContent className="">
            <SidebarMenu>
              {menus.map((item) => {
                const fullPath = `/jira/workspaces/${workspace.id}/${item.href}`;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={fullPath}>
                        <item.icon /> {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="px-0">
          <SidebarGroupLabel>Dự án</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Thêm dự án</span>
          </SidebarGroupAction>
          <SidebarGroupContent></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </div>
  );
};
