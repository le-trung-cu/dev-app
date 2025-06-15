import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const MemberAvatar = ({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) => {
  return (
    <Avatar className={cn("border bg-primary rounded-sm", className)}>
      <AvatarImage src={src ?? undefined} className="rounded-sm" />
      <AvatarFallback className="rounded-none font-semibold">
        {name?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};
