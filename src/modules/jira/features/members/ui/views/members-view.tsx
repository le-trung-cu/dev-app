"use client";

import { Loader, UserPlus2, Users2 } from "lucide-react";
import { useWorkspaceId } from "../../../workspaces/hooks/use-workspace-id";
import { useGetCurrentMember } from "../../api/use-get-current-member";
import { useGetMembers } from "../../api/use-get-members";
import { MemberRow } from "../components/member-row";
import { Role } from "@/generated/prisma-jira-database/jira-database-client-types";
import { Button } from "@/components/ui/button";
import { InviteMemberModal } from "../components/invite-member-modal";
import { useInviteMemberModal } from "../../hooks/use-invite-member-modal";
import { truncate } from "fs/promises";

export const MembersView = () => {
  const { setOpen } = useInviteMemberModal();
  const workspaceId = useWorkspaceId();
  const { data, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
  const { data: current, isLoading: isLoadingCurrent } = useGetCurrentMember({
    workspaceId,
  });
  if (isLoadingCurrent || isLoadingMembers) {
    return (
      <div className="h-[300px] flex justify-center items-center">
        <Loader className="animate-spin" />
      </div>
    );
  }
  const isAdmin = current?.role === Role.Admin;

  return (
    <>
      <div className="max-w-2xl space-y-2.5">
        <div className="flex items-center gap-5 mb-10">
          <h1 className="text-2xl font-semibold">Danh sách thành viên</h1>
          {isAdmin && (
            <Button className="" variant="outline" size="sm" onClick={() => setOpen(true)}>
              <UserPlus2 /> Thêm thành viên
            </Button>
          )}
        </div>
        {data?.map((item) => {
          return (
            <MemberRow
              key={item.id}
              member={{ ...item }}
              isAdmin={isAdmin}
              isCurrent={current?.id === item.id}
            />
          );
        })}
      </div>
      <InviteMemberModal />
    </>
  );
};
