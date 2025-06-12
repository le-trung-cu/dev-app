import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const WorkspaceAvatar = ({
  src,
  name,
}: {
  src?: string;
  name: string;
}) => {
  return (
    <Avatar className="border bg-primary rounded-sm">
      <AvatarImage src={src} className="rounded-sm" />
      <AvatarFallback className="rounded-none font-semibold">{name?.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};
