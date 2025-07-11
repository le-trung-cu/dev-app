"use client";

import * as React from "react";

import { NavUser } from "@/modules/auth/ui/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { WorkspaceSwitcher } from "../modules/jira/features/workspaces/ui/components/workspace-switcher";
import { useWorkspaceId } from "../modules/jira/features/workspaces/hooks/use-workspace-id";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useGetCurrent } from "@/modules/auth/api/use-get-current";

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {data: current} = useGetCurrent();
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();
  const workspacePath = !!workspaceId ? `/workspaces/${workspaceId}` : "";
  let app = "/jira";
  if (pathname?.startsWith("/canvas")) {
    app = "/canvas";
  } else if (pathname?.startsWith("/chats")) {
    app = "/chats";
  }
  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <WorkspaceSwitcher />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={{
                      children: "Quản lý dự án với JIRA",
                      hidden: false,
                    }}
                    // isActive={activeItem?.title === item.title}
                    className="px-2.5 md:px-2"
                    asChild
                  >
                    <Link href={`/jira${workspacePath}`} className={cn(app === "/jira" && "border")}>
                      <Image
                        src="/atlassian_jira_logo_icon_170511.svg"
                        alt="logo"
                        width={30}
                        height={30}
                      />
                    </Link>
                  </SidebarMenuButton>

                  <SidebarMenuButton
                    tooltip={{
                      children:
                        "Với Canvas, bạn có thể thiết kế, tạo, in và làm việc trên mọi thứ.",
                      hidden: false,
                    }}
                    isActive={false}
                    className="px-2.5 md:px-2"
                    asChild
                  >
                    <Link href={`/canvas${workspacePath}`} className={cn(app === "/canvas" && "border")}>
                      <Image
                        src="/figma-logo-22789.svg"
                        alt="logo"
                        width={30}
                        height={30}
                      />
                    </Link>
                  </SidebarMenuButton>

                  <SidebarMenuButton
                    tooltip={{
                      children:
                        "chats, tham gia trò chuyện với các thành viên khác",
                      hidden: false,
                    }}
                    // isActive={activeItem?.title === item.title}
                    className="px-2.5 md:px-2"
                    asChild
                  >
                    <Link href={`/chats${workspacePath}`} className={cn(app === "/chats" && "border")}>
                      <Image
                        src="/chats.svg"
                        alt="logo"
                        width={30}
                        height={30}
                      />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          {!!current?.user && <NavUser user={current.user} />}
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      {props.children && (
        <Sidebar collapsible="none" className="hidden flex-1 md:flex">
          {props.children}
        </Sidebar>
      )}
    </Sidebar>
  );
}
