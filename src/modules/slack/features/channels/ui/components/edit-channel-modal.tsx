"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateChannelModal } from "../../hooks/use-create-channel-modal";
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
import { useCreateChannel } from "../../api/use-create-channel";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { updateChannelSchema } from "../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChannelType } from "@/generated/prisma-jira-database/jira-database-client-types";
import { useEffect } from "react";
import { useEditTaskModal } from "@/modules/jira/features/tasks/hooks/use-edit-task-modal";
import { useEditChannelModal } from "../../hooks/use-edit-channel-modal";
import { useGetChannel } from "../../api/use-get-channel";
import { Loader, TriangleAlert } from "lucide-react";
import { useUpdateChannel } from "../../api/use-update-channel";
import { channel } from "diagnostics_channel";

export const EditChannelModal = () => {
  const workspaceId = useWorkspaceId();
  const { isOpen,close, channelId } = useEditChannelModal();

  const { data: channel, isLoading } = useGetChannel({
    workspaceId,
    channelId: channelId as string,
  });

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thay đổi tên kênh trò chuyện</DialogTitle>
        </DialogHeader>
        {isLoading && (
          <div className="h-[200px] flex justify-center items-center">
            <Loader className="animate-spin" />
          </div>
        )}
        {!isLoading && !channel && (
          <div className="h-[200px] flex justify-center items-center">
            <TriangleAlert className="animate-spin" />
          </div>
        )}
        {!!channel && <EditChannelForm initialValues={channel} onSuccess={close}/>}
      </DialogContent>
    </Dialog>
  );
};

const EditChannelForm = ({
  initialValues,
  onSuccess,
}: {
  initialValues: {
    workspaceId: string;
    id: string;
    name: string;
    type: ChannelType;
  };
  onSuccess?: () => void;
}) => {
  const form = useForm({
    resolver: zodResolver(updateChannelSchema),
    defaultValues: {
      name: initialValues.name,
      type: initialValues.type,
    },
  });

  const { mutate, isPending } = useUpdateChannel();

  const onSubmit = (data: z.infer<typeof updateChannelSchema>) => {
    if (isPending) return;
    mutate(
      { ...data, workspaceId: initialValues.workspaceId, channelId: initialValues.id },
      {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label>Tên</Label>
              <FormControl>
                <Input {...field} placeholder="daily report... " />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Lựa chọn thể loại cuộc trò chuyện</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  value={field.value}
                  onValueChange={(v) => field.onChange(v)}
                  disabled
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ChannelType.TEXT}>TEXT</SelectItem>
                    <SelectItem value={ChannelType.AUDIO}>AUDIO</SelectItem>
                    <SelectItem value={ChannelType.VIDEO}>VIDEO</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-between mt-10">
          <span></span>
          <Button>Lưu thay đổi</Button>
        </div>
      </form>
    </Form>
  );
};
