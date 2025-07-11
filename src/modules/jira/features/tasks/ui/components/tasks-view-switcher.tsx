import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryState, parseAsString } from "nuqs";
import { DataTable } from "./data-table";
import { useGetTasks } from "../../api/use-get-tasks";
import { useWorkspaceId } from "../../../workspaces/hooks/use-workspace-id";
import { FilePlus, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTaskModal } from "../../hooks/use-create-task-modal";
import { TaskFilters } from "./task-filters";
import { useGetProjects } from "../../../projects/api/use-get-projects";
import { useTaskFilters } from "../../hooks/use-task-filters";
import { TaskStatus } from "@/generated/prisma-jira-database/jira-database-client-types";
import { useGetMembers } from "../../../members/api/use-get-members";
import { useCallback, useMemo } from "react";
import { DataKanban } from "./data-kanban";
import { DataCalendar } from "./data-calendar";
import { useBulkUpdateTasks } from "../../api/use-bulk-update-tasks";

export const TasksViewSwitcher = ({
  hiddenProjects = false,
}: {
  hiddenProjects?: boolean;
}) => {
  const { setOpen } = useCreateTaskModal();

  const [view, setView] = useQueryState(
    "view",
    parseAsString.withDefault("table").withOptions({ clearOnDefault: false })
  );
  const workspaceId = useWorkspaceId();
  const [filters, _] = useTaskFilters();
  const { data: tasks, isLoading } = useGetTasks({
    workspaceId,
    projectId: filters.projectId,
    status: filters.status as TaskStatus,
    endDate: filters.endDate,
    assigneeId: filters.assigneeId,
  });
  const { data: projects } = useGetProjects({ workspaceId });
  const { data: _members } = useGetMembers({ workspaceId });
  const members = useMemo(() => _members?.filter((x) => x.joined), [_members]);
  const { mutate: bulkUpdate } = useBulkUpdateTasks();

  const onKanbanChange = useCallback(
    (tasks: { id: string; status: TaskStatus; position: number }[]) => {
      bulkUpdate({
        workspaceId,
        data: { tasks },
      });
    },
    [bulkUpdate]
  );

  return (
    <Tabs
      value={view}
      onValueChange={setView}
      className="h-full border rounded-sm p-2"
    >
      <div className="flex gap-x-5 items-center bg-muted w-fit pr-1 rounded-sm">
        <TabsList>
          <TabsTrigger value="table">table</TabsTrigger>
          <TabsTrigger value="kanban">kanban</TabsTrigger>
          <TabsTrigger value="calendar">calendar</TabsTrigger>
        </TabsList>
        <Button
          variant="default"
          size="sm"
          className="py-0 h-7"
          onClick={() => setOpen(true)}
        >
          <FilePlus /> Thêm công việc
        </Button>
      </div>
      <TaskFilters projects={projects ?? []} members={members ?? []} hiddenProjects={hiddenProjects}/>
      <TabsContent value="table">
        {isLoading ? <Loading /> : <DataTable data={tasks ?? []} />}
      </TabsContent>
      <TabsContent value="kanban">
        {isLoading ? (
          <Loading />
        ) : (
          <DataKanban data={tasks ?? []} onChange={onKanbanChange} />
        )}
      </TabsContent>
      <TabsContent value="calendar" className=" ">
        {isLoading ? <Loading /> : <DataCalendar data={tasks ?? []} />}
      </TabsContent>
    </Tabs>
  );
};

function Loading() {
  return (
    <div className="h-[200px] flex justify-center items-center w-full">
      <Loader className="animate-spin" />
    </div>
  );
}
