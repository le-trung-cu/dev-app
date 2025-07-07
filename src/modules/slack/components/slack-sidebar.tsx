"use client";

import * as React from "react";
import {
  Mic,
  PencilLine,
  Plus,
} from "lucide-react";

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
import Link from "next/link";
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
import { useGetWorkspaces } from "@/modules/jira/features/workspaces/api/use-get-workspaces";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { useCreateChannelModal } from "../features/channels/hooks/use-create-channel-modal";
import { ChannelType } from "@/generated/prisma-jira-database/jira-database-client-types";
import { useGetChannels } from "../features/channels/api/use-get-channels";
import { WorkspaceChannel } from "../features/channels/ui/components/workspace-channel";

export const SlackSidebar = () => {
  const { data: workspaces } = useGetWorkspaces();
  const workspaceId = useWorkspaceId();
  const workspace = workspaces?.find((x) => x.id == workspaceId);
  const { setOpen } = useCreateChannelModal();

  const { data: channels } = useGetChannels({ workspaceId });

  const textChannels = React.useMemo(
    () => channels?.filter((x) => x.type === ChannelType.TEXT),
    [channels]
  );

  const voiceChannels = React.useMemo(
    () => channels?.filter((x) => x.type === ChannelType.AUDIO),
    [channels]
  );
  const videoChannels = React.useMemo(
    () => channels?.filter((x) => x.type === ChannelType.VIDEO),
    [channels]
  );

  if (!workspace) return null;

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
          <SidebarGroupLabel className="uppercase">
            Chủ đề trò chuyện
          </SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus onClick={() => setOpen(true, { type: ChannelType.TEXT })} />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {textChannels?.map((item) => {
                const fullPath = `/chats/workspaces/${workspace.id}/channels/${item.id}`;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <WorkspaceChannel channel={item} isAdmin={true}/>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="px-0">
          <SidebarGroupLabel className="uppercase">
            Voice Channels
          </SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus onClick={() => setOpen(true, { type: ChannelType.AUDIO })} />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {voiceChannels?.map((item) => {
                const fullPath = `/chats/workspaces/${workspace.id}/channels/${item.id}`;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <WorkspaceChannel channel={item} isAdmin={true}/>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="px-0">
          <SidebarGroupLabel className="uppercase">
            Video Channels
          </SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus onClick={() => setOpen(true, { type: ChannelType.VIDEO })} />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {videoChannels?.map((item) => {
                const fullPath = `/chats/workspaces/${workspace.id}/channels/${item.id}`;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <WorkspaceChannel channel={item} isAdmin={true}/>
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
