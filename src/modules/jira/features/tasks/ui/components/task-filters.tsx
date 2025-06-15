import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Member,
  Project,
  TaskStatus,
} from "@/generated/prisma-jira-database/jira-database-client-types";
import { ProjectAvatar } from "../../../projects/ui/components/project-avatar";
import { useTaskFilters } from "../../hooks/use-task-filters";
import { FormLabel } from "@/components/ui/form";
import { MemberAvatar } from "../../../members/ui/components/member-avatar";
import { Badge } from "@/components/ui/badge";
import { camelCaseToTitleCase } from "@/lib/utils";

interface Props {
  hiddenProjects?: boolean;
  filterOnProject?: boolean;
  projects: Project[];
  members: (Member & {
    name: string;
    email: string;
    image: string | null;
  })[];
}
export const TaskFilters = ({
  hiddenProjects = false,
  projects,
  members,
}: Props) => {
  const [filters, setFilters] = useTaskFilters();

  const onFilterChange = (name: string, value: string) => {
    if (value === null || value == undefined || value === "all") {
      value = "";
    }
    setFilters(name, value);
  };
  return (
    <div className="flex gap-5 items-center">
      {!hiddenProjects && (
        <div className="flex gap-2 items-center">
          <label className="text-xs font-semibold text-gray-600">Dự án</label>
          <Select
            value={filters.projectId ?? undefined}
            onValueChange={(value) => onFilterChange("projectId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="tất cả dự án" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-muted-foreground">
                tất cả dự án
              </SelectItem>
              {projects.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  <ProjectAvatar name={item.name} />
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <label className="text-xs font-semibold text-gray-600">
          Người thực hiện
        </label>
        <Select
          value={filters.assigneeId ?? undefined}
          onValueChange={(value) => onFilterChange("assigneeId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="tất cả thành viên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-muted-foreground">
              tất cả thành viên
            </SelectItem>
            {members.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                <div className="flex justify-between items-center gap-5">
                  <MemberAvatar name={item.name} src={item.image} />
                  <div className="flex flex-col justify-start">
                    <span className="text-sm font-semibold text-left">
                      {item.name}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {item.email}
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 items-center">
        <label className="text-xs font-semibold text-gray-600">
          Trạng thái
        </label>
        <Select
          value={filters.status ?? undefined}
          onValueChange={(value) => onFilterChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-muted-foreground">
              tất cả trạng thái
            </SelectItem>
            {[
              TaskStatus.Backlog,
              TaskStatus.Done,
              TaskStatus.InProcess,
              TaskStatus.InReview,
              TaskStatus.Todo,
            ].map((item) => (
              <SelectItem key={item} value={item}>
                {camelCaseToTitleCase(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
