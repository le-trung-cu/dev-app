import { Button } from "@/components/ui/button";
import {
  Member,
  Project,
  Task,
} from "@/generated/prisma-jira-database/jira-database-client-types";
import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { ProjectAvatar } from "../../../projects/ui/components/project-avatar";
import { MemberAvatar } from "../../../members/ui/components/member-avatar";
import { TaskDate } from "./task-date";
import { camelCaseToTitleCase } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TaskActions } from "./task-actions";

const columnHelper = createColumnHelper<
  Omit<Task, "endDate" | "createdAt" | "updatedAt"> & {
    endDate: string | null;
    project?: Omit<Project, "createdAt" | "updatedAt"> | null;
    assignee?: Omit<Member, "createdAt" | "updatedAt"> & {
      name: string;
      email: string;
      image: string;
    };
  }
>();

export const columns = [
  columnHelper.accessor("name", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên công việc
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: (info) => {
      return <p className="line-clamp-1">{info.getValue()}</p>;
    },
  }),
  columnHelper.accessor("project", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dự án
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: (info) => {
      const project = info.row.original.project;
      if (!project) return null;
      return (
        <div className="flex items-center gap-x-2 text-sm font-medium">
          <ProjectAvatar className="size-6" name={project.name} />
          <p className="line-clamp-1">{project.name}</p>
        </div>
      );
    },
  }),
  columnHelper.accessor("assignee", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Người nhận
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const assignee = row.original.assignee;
      if (!assignee) return;
      return (
        <div className="flex items-center gap-x-2 text-sm font-medium">
          <MemberAvatar className="size-6" name={assignee.name} />
          <p className="line-clamp-1">{assignee.name}</p>
        </div>
      );
    },
  }),
  columnHelper.accessor("endDate", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ngày kết thúc
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (info) => {
      const endDate = info.getValue();
      return <TaskDate value={endDate} />;
    },
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Trạng thái
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (info) => {
      const status = info.getValue();
      if (!status) return null;
      return <Badge variant={status}>{camelCaseToTitleCase(status)}</Badge>;
    },
  }),
  columnHelper.accessor("priority", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mức độ ưu tiên  
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (info) => {
      const status = info.getValue();
      if (!status) return null;
      return <Badge variant={status}>{camelCaseToTitleCase(status)}</Badge>;
    },
  }),
  columnHelper.display({
    id: "task-actions",
    cell: ({ row }) => {
      return (
        <TaskActions
          taskId={row.original.id}
          workspaceId={row.original.workspaceId}
        >
          <Button variant="ghost" size="icon">
            <MoreVertical className="size-4 text-muted-foreground text-sm"/>
          </Button>
        </TaskActions>
      );
    },
  }),
];
