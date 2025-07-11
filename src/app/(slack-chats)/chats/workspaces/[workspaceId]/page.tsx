"use client";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { useGetChannels } from "@/modules/slack/features/channels/api/use-get-channels";
import { useCreateChannelModal } from "@/modules/slack/features/channels/hooks/use-create-channel-modal";
import { Loader, Loader2 } from "lucide-react";
import Image from "next/image";

export default function WorkspaceIdPage() {
  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetChannels({ workspaceId });
  const { open, setOpen } = useCreateChannelModal();

  if (isLoading) {
    return (
      <div className="h-[300px] flex justify-center items-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-10">
      <Image
        src="/Meetings-That-You-Should-Run-in-Slack-.jpg"
        width={384 * 2}
        height={216 * 2}
        alt="Meetings-That-You-Should-Run-in-Slack"
      />

      <div className="mt-10 flex flex-col items-center">
        <p>
          Bạn có thể Tham gia thảo luận với các thành viên trong cùng workspace
        </p>
        {data && data.length === 0 && (
          <>
            <p className="text-sm mt-10">
              Bạn chưa có bất kỳ chủ đề trò chuyện nào.
            </p>
            <Button
              variant="link"
              className="mt-2 underline"
              onClick={() => setOpen(true)}
            >
              Hãy tạo chủ đề trò chuyện đầu tiên của workspace
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
