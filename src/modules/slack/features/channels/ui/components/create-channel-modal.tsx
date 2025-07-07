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
import { createChannelSchema } from "../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChannelType } from "@/generated/prisma-jira-database/jira-database-client-types";
import { useEffect } from "react";

export const CreateChannelModal = () => {
  const workspaceId = useWorkspaceId();
  const { open, setOpen, initialValues } = useCreateChannelModal();
  const form = useForm({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
      type: initialValues?.type ?? "TEXT",
    },
  });

  useEffect(() => {
    form.setValue("type", initialValues?.type ?? "TEXT");
  }, [initialValues]);

  const { mutate, isPending } = useCreateChannel();
  const onSubmit = (data: z.infer<typeof createChannelSchema>) => {
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
          <DialogTitle>Tạo kênh trò chuyện</DialogTitle>
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
              <Button>Tạo mới</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
