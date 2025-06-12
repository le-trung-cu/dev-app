"use client";
import { useGetWorkspaces } from "../../api/use-get-workspaces";
import { useWorkspaceId } from "../../hooks/use-workspace-id";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { WorkspaceAvatar } from "./workspace-avatar";
import Link from "next/link";
import { useCreateWorkspaceDialog } from "../../hooks/use-create-workspace-dialog";
// import { NEXT_PUBLIC_API_HOST_ADDRESS } from "@/constant";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar();
  const { data: workspaces } = useGetWorkspaces();
  const workspaceId = useWorkspaceId();
  const activeWorkspace = workspaces?.find((x) => x.id == workspaceId);
  const { setOpen } = useCreateWorkspaceDialog();

  if (!activeWorkspace) {
    return null;
  }

  return (
    <SidebarMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
              <WorkspaceAvatar name={activeWorkspace.name} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          align="start"
          side={isMobile ? "bottom" : "right"}
          sideOffset={4}
        >
          <DropdownMenuLabel className="text-muted-foreground text-xs">
            Workspaces
          </DropdownMenuLabel>
          {workspaces?.map((item, index) => (
            <DropdownMenuItem key={item.id} className="gap-2 p-2" asChild>
              <Link href={`/jira/workspaces/${item.id}`}>
                <WorkspaceAvatar name={item.name} />
                {item.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 p-2" onClick={() => setOpen(true)}>
            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
              <Plus className="size-4" />
            </div>
            <div className="text-muted-foreground font-medium">
              Thêm workspace
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenu>
  );
}
