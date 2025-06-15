import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Member,
  Role,
} from "@/generated/prisma-jira-database/jira-database-client-types";
import { MoreVertical, Trash2 } from "lucide-react";
import { useDeleteMember } from "../../api/use-delete-member";
import { useUpdateRole } from "../../api/use-update-role";
import { useConfirm } from "@/hooks/use-confirm";

interface Props {
  member: Member & {
    name: string;
    email: string;
    image: string | null;
  };
  isAdmin: boolean;
  isCurrent: boolean;
}

export const MemberActions = ({ member, isAdmin, isCurrent }: Props) => {
  const [ConfirmModal, confirm] = useConfirm();
  const { mutate: deleteMemberApi, isPending: isDeleteMember } =
    useDeleteMember();
  const onDeleteMemberHandler = async () => {
    const ok = await confirm({
      title: "Xoá thành viên",
      description: "Thành viên sẽ không còn trong workspace",
    });
    if (!ok) return;
    deleteMemberApi({ workspaceId: member.workspaceId, memberId: member.id });
  };

  const { mutate: updateRoleApi, isPending: isUpdateRole } = useUpdateRole();
  const onUpdateRoleHandler = (role: Role) => {
    updateRoleApi({
      workspaceId: member.workspaceId,
      memberId: member.id,
      role,
    });
  };
  if (!isAdmin && !isCurrent) return null;
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {isAdmin && (
            <DropdownMenuItem onClick={() => onUpdateRoleHandler(Role.Admin)}>
              Đặt vai trò là Admin
            </DropdownMenuItem>
          )}
          {isAdmin && (
            <DropdownMenuItem onClick={() => onUpdateRoleHandler(Role.Member)}>
              Đặt vai trò là Member
            </DropdownMenuItem>
          )}
          {isCurrent && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                Rời khỏi workspace
              </DropdownMenuItem>
            </>
          )}
          {isAdmin && !isCurrent && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={onDeleteMemberHandler}
              >
                <Trash2 /> {member.joined ? "Xoá thành viên" : "Huỷ lời mời"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmModal />
    </>
  );
};
