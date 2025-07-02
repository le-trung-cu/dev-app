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
import { useCreateProjectModal } from "../features/projects/hooks/use-create-project-modal";
import { useGetProjects } from "../features/projects/api/use-get-projects";
import { ProjectAvatar } from "../features/projects/ui/components/project-avatar";
import { useGetCurrentMember } from "../features/members/api/use-get-current-member";
import { useGetWorkspaces } from "../features/workspaces/api/use-get-workspaces";
import { useWorkspaceId } from "../features/workspaces/hooks/use-workspace-id";

const menus = [
  {
    icon: HomeIcon,
    title: "Home",
    href: "",
  },
  { icon: Notebook, title: "My tasks", href: "tasks" },
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
] as const;
export const JiraSidebar = () => {
  const { setOpen } = useCreateProjectModal();
  const { data: workspaces } = useGetWorkspaces();
  const workspaceId = useWorkspaceId();
  const workspace = workspaces?.find((x) => x.id == workspaceId);
  const { data: projects } = useGetProjects({ workspaceId: workspace?.id });
  const { data: member } = useGetCurrentMember({ workspaceId: workspace?.id });

  if(!workspace) return null;
  
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
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupLabel>Menus</SidebarGroupLabel>
          <SidebarGroupContent className="">
            <SidebarMenu>
              {menus.map((item) => {
                let fullPath = `/jira/workspaces/${workspace.id}/${item.href}`;
                if (item.title === "My tasks") {
                  fullPath = `/jira/workspaces/${workspace.id}/${item.href}?assigneeId=${member?.id ?? ""}`;
                }
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
          <SidebarGroupAction onClick={() => setOpen(true)}>
            <Plus /> <span className="sr-only">Thêm dự án</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((item) => {
                const fullPath = `/jira/workspaces/${workspace.id}/projects/${item.id}?projectId=${item.id}`;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <Link href={fullPath}>
                        <ProjectAvatar name={item.name} />
                        {item.name}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </div>
  );
};
