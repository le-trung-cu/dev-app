"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateTaskModal } from "../../hooks/use-create-task-modal";
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
import { createTaskSchema } from "../../schema";
import { useWorkspaceId } from "../../../workspaces/hooks/use-workspace-id";
import {
  Member,
  Priority,
  Project,
  Role,
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
import { useCreateTask } from "../../api/use-create-task";
import { useGetProjects } from "../../../projects/api/use-get-projects";
import { DatePicker } from "@/components/date-picker";

interface Props {
  projectOptions: Omit<Project, "createdAt" | "updatedAt">[];
  assigneeOptions: (Omit<Member, "createdAt" | "updatedAt"> & {
    name: string;
    email: string;
    image: string | null;
  })[];
}
const CreateTaskModalContent = ({ projectOptions, assigneeOptions }: Props) => {
  const { open, setOpen } = useCreateTaskModal();
  const workspaceId = useWorkspaceId();
  console.log({ TaskStatus, Role, Priority });
  const form = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      name: "",
      projectId: "",
      assigneeId: null,
      endDate: null,
      status: TaskStatus.InReview as any,
    },
  });
  const { mutate, isPending } = useCreateTask();
  const onSubmit = (data: z.infer<typeof createTaskSchema>) => {
    if (isPending) return;
    mutate(
      { ...data, workspaceId },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo Task</DialogTitle>
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
                      value={field.value ?? undefined}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn dự án" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectOptions.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
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
                      value={field.value ?? undefined}
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn người được giao công việc" />
                      </SelectTrigger>
                      <SelectContent>
                        {assigneeOptions.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
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
              <Button>Tạo mới</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const CreateTaskModal = () => {
  const { open, setOpen } = useCreateTaskModal();
  const workspaceId = useWorkspaceId();
  const { data: projects, isPending: isPendingProjects } = useGetProjects({
    workspaceId,
  });

  const { data: members, isPending: isPendingMembers } = useGetMembers({
    workspaceId,
  });

  if (isPendingProjects || isPendingMembers) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
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
    <CreateTaskModalContent
      projectOptions={projects!}
      assigneeOptions={members!}
    />
  );
};
