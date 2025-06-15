import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";
import { useWorkspaceId } from "../../../workspaces/hooks/use-workspace-id";
import { Task } from "@/generated/prisma-jira-database/jira-database-client-types";
import Link from "next/link";

export const UpcomingTasks = ({
  data,
}: {
  data: (Omit<Task, "endDate" | "createdAt" | "updatedAt"> & {
    endDate: string | null;
  })[];
}) => {
  const workspaceId = useWorkspaceId();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
        <CardDescription>Here are the tasks that are due soon</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No upcoming tasks yet
          </p>
        ) : (
          data.map((task) => (
            <Link
              href={`/jira/workspaces${workspaceId}/tasks/${task.id}`}
              key={task.id}
              className="flex items-start space-x-3 border-b pb-3 last:border-0"
            >
              <div
                className={cn(
                  "mt-0.5 rounded-full p-1",
                  task.priority === "High" && "bg-red-100 text-red-700",
                  task.priority === "Medium" && "bg-yellow-100 text-yellow-700",
                  task.priority === "Low" && "bg-gray-100 text-gray-700"
                )}
              >
                {task.status === "Done" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>

              <div className="space-y-1">
                <p className="font-medium text-sm md:text-base">{task.name}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{task.status}</span>
                  {task.endDate && (
                    <>
                      <span className="mx-1"> - </span>
                      <span>
                        {format(new Date(task.endDate), "MMM d, yyyy")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
};
