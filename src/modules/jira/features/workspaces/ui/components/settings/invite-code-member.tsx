import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Workspace } from "@/generated/prisma-jira-database/jira-database-client-types";
import { Copy, RefreshCcw } from "lucide-react";

interface Props {
  initialValues: Workspace;
}

export const InviteCodeMember = ({ initialValues }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thêm thành viên</CardTitle>
        <CardDescription>
          Chia sẻ link sau để thêm thành viên vào workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1">
          <Input value={initialValues.inviteCode} readOnly />
          <Button variant="outline" size="icon">
            <Copy />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="destructive">
          <RefreshCcw />
          Cập nhật
        </Button>
      </CardFooter>
    </Card>
  );
};
