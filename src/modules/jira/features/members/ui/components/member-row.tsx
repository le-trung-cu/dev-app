import { Badge } from "@/components/ui/badge";
import {
  Member,
  Role,
} from "@/generated/prisma-jira-database/jira-database-client-types";
import { MemberAvatar } from "./member-avatar";
import { MemberActions } from "./member-actions";
import { useInviteJoin } from "../../api/use-invite-join";

interface Props {
  member: Member & {
    name: string;
    email: string;
    image: string | null;
  };
  isAdmin: boolean;
  isCurrent: boolean;
}
export const MemberRow = ({ member, isAdmin, isCurrent }: Props) => {


  return (
    <div className="flex justify-between items-center gap-5 border p-2 rounded-sm">
      <MemberAvatar name={member.name} src={member.image} />
      <div className="mr-auto">
        <div>
          <span className="text-sm font-semibold mr-2">{member.name}</span>{" "}
          <Badge variant="secondary">{member.role}</Badge>
        </div>
        <div className="text-xs text-muted-foreground">{member.email}</div>
      </div>
      {!member.joined && (
        <Badge variant="secondary">lời mời đang chờ chấp nhận</Badge>
      )}
      <MemberActions member={member} isAdmin={isAdmin} isCurrent={isCurrent} />
    </div>
  );
};
