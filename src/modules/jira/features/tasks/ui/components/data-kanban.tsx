import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Member,
  Project,
  Task,
  TaskStatus,
} from "@/generated/prisma-jira-database/jira-database-client-types";
import { camelCaseToTitleCase } from "@/lib/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggableStyle,
  DropResult,
} from "@hello-pangea/dnd";
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TaskActions } from "./task-actions";
import { MoreHorizontal } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { TaskDate } from "./task-date";
import { ProjectAvatar } from "../../../projects/ui/components/project-avatar";
import { MemberAvatar } from "../../../members/ui/components/member-avatar";

const grid = 8;
const getItemStyle = (
  isDragging: boolean,
  draggableStyle: DraggableStyle
): CSSProperties => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "white",

  // styles we need to apply on draggables
  ...draggableStyle,
});
const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "white",
  padding: 8,
  width: 350,
});

interface Props {
  data: (Omit<Task, "endDate" | "createdAt" | "updatedAt"> & {
    endDate?: string | null;
    project?: Omit<Project, "createdAt" | "updatedAt"> | null;
    assignee?:
      | (Omit<Member, "createdAt" | "updatedAt"> & {
          name: string;
          email: string;
          image: string | null;
        })
      | null;
  })[];
  onChange: (tasks: { id: string; status: TaskStatus; position: number }[]) => void;
}

export const DataKanban = ({ data, onChange }: Props) => {
  const [tasks, setTasks] = useState(() => {
    const newTasks = {
      [TaskStatus.Backlog]: new Array<Props["data"][number]>(),
      [TaskStatus.Todo]: new Array<Props["data"][number]>(),
      [TaskStatus.InProcess]: new Array<Props["data"][number]>(),
      [TaskStatus.InReview]: new Array<Props["data"][number]>(),
      [TaskStatus.Done]: new Array<Props["data"][number]>(),
    };

    return newTasks;
  });
  useEffect(() => {
    const newTasks = {
      [TaskStatus.Backlog]: new Array<Props["data"][number]>(),
      [TaskStatus.Todo]: new Array<Props["data"][number]>(),
      [TaskStatus.InProcess]: new Array<Props["data"][number]>(),
      [TaskStatus.InReview]: new Array<Props["data"][number]>(),
      [TaskStatus.Done]: new Array<Props["data"][number]>(),
    };

    for (const task of data) {
      if (!task.status) continue;
      newTasks[task.status].push(task);
    }

    Object.keys(newTasks).forEach((status) => {
      newTasks[status as TaskStatus].sort((a, b) => a.position - b.position);
    });
    setTasks(newTasks);
  }, [data]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination } = result;
      const sourceStatus = source.droppableId as TaskStatus;
      const destStatus = destination.droppableId as TaskStatus;

      let updatesPayload: {
        id: string;
        status: TaskStatus;
        position: number;
      }[] = [];

      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };

        // Safely remove the task from the source column
        const sourceColumn = [...newTasks[sourceStatus]];
        const [movedTask] = sourceColumn.splice(source.index, 1);

        // If there's no moved task (shouldn't happen, but just in case), return the previous state
        if (!movedTask) {
          console.error("No task found at the source index");
          return prevTasks;
        }

        // Create a new task object with potentially updated status
        const updatedMovedTask =
          sourceStatus !== destStatus
            ? { ...movedTask, status: destStatus }
            : movedTask;

        // Update the source column
        newTasks[sourceStatus] = sourceColumn;

        // Add the task to the destination column
        const destColumn = [...newTasks[destStatus]];
        destColumn.splice(destination.index, 0, updatedMovedTask);
        newTasks[destStatus] = destColumn;

        // Prepare minimal update payloads
        updatesPayload = [];

        // Always update the moved task
        updatesPayload.push({
          id: updatedMovedTask.id,
          status: destStatus,
          position: Math.min((destination.index + 1) * 1000, 1_000_000),
        });

        // Update positions for affected tasks in the destination column
        newTasks[destStatus].forEach((task, index) => {
          if (task && task.id !== updatedMovedTask.id) {
            const newPosition = Math.min((index + 1) * 1000, 1_000_000);
            if (task.position !== newPosition) {
              updatesPayload.push({
                id: task.id,
                status: destStatus,
                position: newPosition,
              });
            }
          }
        });

        // If the task moved between columns, update positions in the source column
        if (sourceStatus !== destStatus) {
          newTasks[sourceStatus].forEach((task, index) => {
            if (task) {
              const newPosition = Math.min((index + 1) * 1000, 1_000_000);
              if (task.position !== newPosition) {
                updatesPayload.push({
                  id: task.id,
                  status: sourceStatus,
                  position: newPosition,
                });
              }
            }
          });
        }

        return newTasks;
      });

      onChange(updatesPayload);
    },
    [onChange]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-5">
        {[
          TaskStatus.Backlog,
          TaskStatus.Todo,
          TaskStatus.InProcess,
          TaskStatus.InReview,
          TaskStatus.Done,
        ].map((status) => (
          <div key={status} className="border rounded-sm">
            <div className="p-2 font-semibold">
              {camelCaseToTitleCase(status)}
            </div>
            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                  className="h-full"
                >
                  {tasks[status].map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        // <div
                        //   ref={provided.innerRef}
                        //   {...provided.draggableProps}
                        //   {...provided.dragHandleProps}
                        //   style={getItemStyle(
                        //     snapshot.isDragging,
                        //     provided.draggableProps.style!
                        //   )}
                        // >
                        //   {item.name}
                        // </div>

                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style!
                          )}
                          className="rounded-sm"
                        >
                          <CardHeader className="">
                            <CardTitle>{item.name}</CardTitle>
                            <CardDescription>
                              {!!item.endDate && (
                                <div className="flex gap-2">
                                  <span className="text-muted-foreground text-sm">
                                    End date:
                                  </span>
                                  <TaskDate value={item.endDate} />
                                </div>
                              )}
                            </CardDescription>
                            <CardAction>
                              <TaskActions
                                workspaceId={item.workspaceId}
                                taskId={item.id}
                              >
                                <MoreHorizontal className="size-4 text-muted-foreground" />
                              </TaskActions>
                            </CardAction>
                          </CardHeader>
                          <Separator />
                          <CardContent>
                            {!!item.assignee && (
                              <div className="flex gap-2 items-center">
                                <MemberAvatar name={item.assignee.name} />
                                <div>
                                  <div className="">{item.assignee.name}</div>
                                  <div className="text-muted-foreground">
                                    {item.assignee.email}
                                  </div>
                                </div>
                              </div>
                            )}
                            {!!item.project && (
                              <div className="flex gap-2 items-center">
                                <ProjectAvatar name={item.project.name} />{" "}
                                {item.project.name}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};
