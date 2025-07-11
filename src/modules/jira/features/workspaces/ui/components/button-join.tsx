import { Button } from "@/components/ui/button";
import { useInviteJoin } from "../../../members/api/use-invite-join";

export const ButtonJoin = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const { mutate, isPending } = useInviteJoin();
  const onJoinHandler = () => {
    mutate({ workspaceId });
  };
  return (
    <Button
      disabled={isPending}
      variant="outline"
      size="sm"
      className="ml-auto"
      onClick={onJoinHandler}
    >
      Tham gia
    </Button>
  );
};
