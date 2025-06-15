import AsyncSelect from "react-select/async";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { client } from "@/lib/rpc";
import { useInviteMemberModal } from "../../hooks/use-invite-member-modal";
import { Button } from "@/components/ui/button";
import { Send, UserPlus } from "lucide-react";
import { useState } from "react";
import { useInviteMembers } from "../../api/use-invite-members";
import { useWorkspaceId } from "../../../workspaces/hooks/use-workspace-id";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Role } from "@/generated/prisma-jira-database/jira-database-client-types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteMembersSchema } from "../../schema";
import { z } from "zod";

const promiseOptions = async (inputValue: string) => {
  const response = await client.api.jira.users.$get({
    query: {
      q: inputValue,
    },
  });

  const users = (await response.json()).users;

  return users.map((user) => ({ value: user.id, label: user.email }));
};

export const InviteMemberModal = () => {
  const workspaceId = useWorkspaceId();
  const { open, setOpen } = useInviteMemberModal();
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const form = useForm({
    resolver: zodResolver(inviteMembersSchema),
    defaultValues: {
      userIds: [],
      role: Role.Member,
    },
  });

  const { mutate, isPending } = useInviteMembers();
  const onSendHandler = (data: z.infer<typeof inviteMembersSchema>) => {
    if (isPending) return;
    mutate(
      {
        workspaceId,
        userIds: data.userIds,
        role: data.role
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Thành viên</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSendHandler)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="userIds"
              render={({ field }) => {
                return (
                  <AsyncSelect
                    isMulti
                    cacheOptions
                    defaultOptions
                    loadOptions={promiseOptions}
                    onChange={(newValue) => {
                      field.onChange(newValue.map((x) => x.value));
                    }}
                  />
                );
              }}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => {
                return (
                  <FormItem className="flex items-center">
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Role.Admin}>Admin</SelectItem>
                          <SelectItem value={Role.Member}>Member</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <DialogFooter>
              <Button disabled={isPending} type="submit">
                <Send /> Gửi lời mời
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
