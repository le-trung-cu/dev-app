"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateProjectModal } from "../../hooks/use-create-project-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateProject } from "../../api/use-create-project";
import { createProjectSchema } from "../../schema";
import { useWorkspaceId } from "../../../workspaces/hooks/use-workspace-id";

export const CreateProjectModal = () => {
  const workspaceId = useWorkspaceId();
  const { open, setOpen } = useCreateProjectModal();
  const form = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
    },
  });
  const { mutate, isPending } = useCreateProject();
  const onSubmit = (data: z.infer<typeof createProjectSchema>) => {
    if (isPending) return;
    mutate({...data, workspaceId}, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
            ></FormField>
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
