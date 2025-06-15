"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTaskSchema, updateTaskSchema } from "../../schema";
import { useWorkspaceId } from "../../../workspaces/hooks/use-workspace-id";
import {
  Member,
  Priority,
  Project,
  Role,
  Task,
  TaskStatus,
} from "@/generated/prisma-jira-database/jira-database-client-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetMembers } from "../../../members/api/use-get-members";
import { Loader } from "lucide-react";
import { useGetProjects } from "../../../projects/api/use-get-projects";
import { DatePicker } from "@/components/date-picker";
import { useEditTaskModal } from "../../hooks/use-edit-task-modal";
import { useGetTask } from "../../api/use-get-task";
import { useUpdateTask } from "../../api/use-update-task";

interface Props {
  projectOptions: Omit<Project, "createdAt" | "updatedAt">[];
  assigneeOptions: (Omit<Member, "createdAt" | "updatedAt"> & {
    name: string;
    email: string;
    image: string | null;
  })[];
  initialValues: Omit<Task, "endDate" | "createdAt" | "updatedAt"> & {
    endDate: string | null;
  };
}
const EditTaskModalContent = ({
  projectOptions,
  assigneeOptions,
  initialValues,
}: Props) => {
  const { isOpen, close } = useEditTaskModal();
  const workspaceId = useWorkspaceId();
  console.log({ TaskStatus, Role, Priority });
  const form = useForm({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      name: initialValues.name,
      projectId: initialValues.projectId,
      assigneeId: initialValues.assigneeId,
      endDate: initialValues.endDate as unknown as string,
      status: initialValues.status as unknown as TaskStatus,
      priority: initialValues.priority as unknown as Priority
    },
  });
  const { mutate, isPending } = useUpdateTask();
  const onSubmit = (data: z.infer<typeof updateTaskSchema>) => {
    if (isPending) return;
    mutate(
      { ...data, workspaceId, taskId: initialValues.id },
      {
        onSuccess: () => {
          close();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label>Tên</Label>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dự án</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn dự án" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectOptions.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người thực hiện</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(v) => field.onChange(parseInt(v))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn người được giao công việc" />
                      </SelectTrigger>
                      <SelectContent>
                        {assigneeOptions.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-10">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Trạng thái công việc</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        value={field.value}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TaskStatus.Backlog}>
                            Backlog
                          </SelectItem>
                          <SelectItem value={TaskStatus.Todo}>Todo</SelectItem>
                          <SelectItem value={TaskStatus.InProcess}>
                            In process
                          </SelectItem>
                          <SelectItem value={TaskStatus.InReview}>
                            In review
                          </SelectItem>
                          <SelectItem value={TaskStatus.Done}>Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Mức độ ưu tiên</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        value={field.value}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Priority.High}>High</SelectItem>
                          <SelectItem value={Priority.Medium}>
                            Medium
                          </SelectItem>
                          <SelectItem value={Priority.Low}>Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày kết thúc</FormLabel>
                  <DatePicker
                    selected={!field.value ? undefined : new Date(field.value)}
                    onSelected={(v) => field.onChange(v?.toUTCString())}
                  />
                </FormItem>
              )}
            />
            <div className="flex justify-between mt-10">
              <span></span>
              <Button>Lưu thay đổi</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const EditTaskModal = () => {
  const { isOpen, taskId, close } = useEditTaskModal();
  const workspaceId = useWorkspaceId();
  const { data: projects, isPending: isPendingProjects } = useGetProjects({
    workspaceId,
  });

  const { data: members, isPending: isPendingMembers } = useGetMembers({
    workspaceId,
  });

  const { data: task, isLoading: isPendingTask } = useGetTask({
    workspaceId,
    taskId,
  });

  if (!isOpen) return null;

  if (isPendingProjects || isPendingMembers || isPendingTask) {
    return (
      <Dialog open={isOpen} onOpenChange={close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <div className="h-[200px] flex justify-center items-center">
            <Loader className="animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <EditTaskModalContent
      projectOptions={projects!}
      assigneeOptions={members!}
      initialValues={task!}
    />
  );
};
