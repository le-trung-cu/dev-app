import Link from "next/link";
import { GetChannelsResponType } from "../../api/use-get-channels";
import { Edit, Trash2 } from "lucide-react";
import { Hint } from "@/components/hint";
import { cn } from "@/lib/utils";
import { useEditChannelModal } from "../../hooks/use-edit-channel-modal";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteChannel } from "../../api/use-delete-channel";
import { usePathname, useRouter } from "next/navigation";
import { iconMap } from "../../types";

interface Props {
  channel: GetChannelsResponType["channels"][number];
  isAdmin: boolean;
  className?: string;
}

export const WorkspaceChannel = ({ channel, isAdmin, className }: Props) => {
  const fullPath = `/chats/workspaces/${channel.workspaceId}/channels/${channel.id}`;
  const pathname = usePathname();
  const router = useRouter();
  const Icon = iconMap[channel.type];
  const { setChannelId } = useEditChannelModal();

  const [ConfirmDialog, confirm] = useConfirm();

  const onEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setChannelId(channel.id);
  };

  const { mutate, isPending } = useDeleteChannel();
  const onDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPending) return;
    const ok = await confirm({
      title: "Xoá kênh chat",
      description:
        "Hành động không thể phục hồi, bao gồm các tin nhắn sẽ được xoá",
    });
    if (!ok) return;
    mutate(
      {
        workspaceId: channel.workspaceId,
        channelId: channel.id,
      },
      {
        onSuccess: () => {
          if (fullPath === pathname) {
            router.replace("/chats");
          }
        },
      }
    );
  };

  return (
    <>
      <ConfirmDialog />
      <Link href={fullPath} className={cn("group/channel", className)}>
        <Icon className="flex-shrink-0 size-5 text-zinc-500 dark:text-zinc-400" />{" "}
        <span>{channel.name}</span>
        {channel.name !== "genneral" && isAdmin && (
          <div className="ml-auto flex items-center gap-x-2">
            <Hint label="Chỉnh sửa">
              <Edit
                onClick={(e) => onEdit(e)}
                className="invisible group-hover/channel:visible w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
              />
            </Hint>
            <Hint label="Xoá">
              <Trash2
                onClick={(e) => onDelete(e)}
                className="invisible group-hover/channel:visible w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
              />
            </Hint>
          </div>
        )}
      </Link>
    </>
  );
};
