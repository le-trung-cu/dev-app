"use client";
import { Button } from "@/components/ui/button";
import { useCreateTaskModal } from "@/modules/jira/features/tasks/hooks/use-create-task-modal";
import { TasksView } from "@/modules/jira/features/tasks/ui/views/tasks-view";
import { FilePlus } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-10 pb-10">
        <h2 className="text-2xl font-semibold">Công việc</h2>
      </div>
      <div className="flex-1">
        <TasksView />
      </div>
    </div>
  );
}
