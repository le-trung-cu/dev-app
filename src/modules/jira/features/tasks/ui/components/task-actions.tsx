import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useEditTaskModal } from "../../hooks/use-edit-task-modal";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteTask } from "../../api/use-delete-task";

interface Props {
  workspaceId: string;
  taskId: string;
  children: React.ReactNode;
}
export const TaskActions = ({ workspaceId, taskId, children }: Props) => {
  const { setTaskId } = useEditTaskModal();
  const [ConfirmModal, confirm] = useConfirm();
  const { mutate: deleteTaskApi, isPending: isDeleting } = useDeleteTask();
  const onDeleteTaskHandler = async () => {
    if (isDeleting) return;
    const ok = await confirm({
      title: "Xoá công việc",
      description: "Công việc sẽ bị xoá, hành động không thể phục hồi",
    });
    if (!ok) return;

    deleteTaskApi({ workspaceId, taskId });
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <ExternalLink /> Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTaskId(taskId)}>
            <Pencil /> Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={isDeleting}
            onClick={onDeleteTaskHandler}
          >
            <Trash2 /> Xoá
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmModal />
    </>
  );
};
