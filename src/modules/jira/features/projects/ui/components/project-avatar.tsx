import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const ProjectAvatar = ({
  name,
  src,
  className
}: {
  name: string;
  src?: string;
  className?: string;
}) => {
  return (
    <Avatar className={cn("border bg-primary rounded-sm", className)}>
      <AvatarImage src={src} className="rounded-sm" />
      <AvatarFallback className="rounded-none font-semibold">{name?.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};
