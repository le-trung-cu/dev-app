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
import { useCreateWorkspaceModal } from "../../hooks/use-create-workspace-modal";
// import { NEXT_PUBLIC_API_HOST_ADDRESS } from "@/constant";
import { Plus } from "lucide-react";
import { ButtonJoin } from "./button-join";
import { usePathname } from "next/navigation";

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar();
  const { data: workspaces } = useGetWorkspaces();
  const workspaceId = useWorkspaceId();
  const activeWorkspace = workspaces?.find((x) => x.id == workspaceId);
  const { setOpen } = useCreateWorkspaceModal();
  const pathname = usePathname();
  if (!activeWorkspace) {
    return null;
  }
  let app = "/jira";
  if (pathname?.startsWith("/canvas")) {
    app = "/canvas";
  } else if (pathname?.startsWith("/chats")) {
    app = "/chats";
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
          {workspaces?.map((item, index) => {
            return item.member!.joined ? (
              <DropdownMenuItem key={item.id} className="gap-2 p-2" asChild>
                <Link href={`${app}/workspaces/${item.id}`}>
                  <WorkspaceAvatar name={item.name} />
                  {item.name}
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem key={item.id} className="gap-2 p-2" asChild>
                <div className="">
                  <WorkspaceAvatar name={item.name} />
                  {item.name}
                  <ButtonJoin workspaceId={item.id} />
                </div>
              </DropdownMenuItem>
            );
          })}
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
