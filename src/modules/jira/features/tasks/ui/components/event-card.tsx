import React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import {
  Member,
  Project,
  Task,
  TaskStatus,
} from "@/generated/prisma-jira-database/jira-database-client-types";
import { useWorkspaceId } from "../../../workspaces/hooks/use-workspace-id";
import { Item } from "@radix-ui/react-dropdown-menu";
import { MemberAvatar } from "../../../members/ui/components/member-avatar";
import { ProjectAvatar } from "../../../projects/ui/components/project-avatar";

interface EventCardProps {
  task: Omit<Task, "endDate"> & {
    endDate?: string | null;
    project?: Project | null;
    assignee?:
      | (Member & {
          name: string;
          email: string;
          image: string | null;
        })
      | null;
  };
}

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.Backlog]: "border-l-pink-500",
  [TaskStatus.Todo]: "border-l-red-500",
  [TaskStatus.InProcess]: "border-l-yellow-500",
  [TaskStatus.InReview]: "border-l-blue-500",
  [TaskStatus.Done]: "border-l-emerald-500",
};

export const EventCard = ({ task }: EventCardProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    router.push(`/jira/workspaces/${workspaceId}/tasks/${task.id}`);
  };

  return (
    <div className="px-2">
      <div
        onClick={onClick}
        className={cn(
          "p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition",
          statusColorMap[task.status!]
        )}
      >
        <p>{task.name}</p>
        <div className="flex items-center gap-x-1">
          {!!task.assignee && <MemberAvatar name={task.assignee.name} />}
          <div className="size-1 rounded-full bg-neutral-300" />
          {!!task.project && <ProjectAvatar name={task.project.name} />}
        </div>
      </div>
    </div>
  );
};
