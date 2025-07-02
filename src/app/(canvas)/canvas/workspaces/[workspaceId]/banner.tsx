"use client";

import { Button } from "@/components/ui/button";
import { useCreateProject } from "@/modules/canvas/features/projects/api/use-create-project";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";

export const Banner = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useCreateProject();
  const onClick = () => {
    mutate(
      {
        workspaceId,
        json: {
          name: "Untitled project",
          json: "",
          width: 900,
          height: 1200,
        },
      },
      {
        onSuccess: ({ project }) => {
          router.push(`/canvas/workspaces/${workspaceId}/editor/${project.id}`);
        },
      }
    );
  };
  return (
    <section className="flex flex-col items-center pt-10">
      <h1 className="text-[8vw] lg:text-[120px]">
        Bạn muốn{" "}
        <span className="bg-gradient-to-r from-indigo-500 from-10%  to-sky-500 to-90% bg-clip-text text-transparent inline-block">
          thiết kế
        </span>{" "}
        gì?
      </h1>
      <p className="text-xl">
        Với Canva, bạn có thể thiết kế, tạo, in và làm việc trên mọi thứ.
      </p>
      <Button
        className="bg-gradient-to-r from-indigo-500 from-10%  to-sky-500 to-90% mt-10 cursor-pointer"
        size="lg"
        disabled={isPending}
        onClick={onClick}
      >
        Bắt đầu thiết kế <MoveRight />
      </Button>
    </section>
  );
};
