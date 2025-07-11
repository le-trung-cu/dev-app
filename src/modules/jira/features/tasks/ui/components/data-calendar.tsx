import {
  Member,
  Project,
  Task,
} from "@/generated/prisma-jira-database/jira-database-client-types";
import {
  addMonths,
  format,
  getDay,
  parse,
  startOfWeek,
  subMonths,
} from "date-fns";
import { useMemo, useState } from "react";
import { vi } from "date-fns/locale";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { EventCard } from "./event-card";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => 1, // Bắt đầu từ thứ 2 (Monday)
  getDay,
  locales: { vi },
});

interface DataCalendarProps {
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
}

interface CustomToolbarProps {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => {
  return (
    <div className="flex mb-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start">
      <Button
        onClick={() => onNavigate("PREV")}
        variant="secondary"
        size="icon"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto">
        <CalendarIcon className="size-4 mr-2" />
        <p className="text-sm">{format(date, "MMMM yyyy")}</p>
      </div>
      <Button
        onClick={() => onNavigate("NEXT")}
        variant="secondary"
        size="icon"
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  );
};

export const DataCalendar = ({ data }: DataCalendarProps) => {
  const [value, setValue] = useState(() => {
    const task = data.find((x) => !!x.endDate);
    return task ? new Date(task.endDate!) : new Date();
  });

  const events = useMemo(() => {
    return data
      .filter((task) => !!task.endDate)
      .map((task) => ({
        start: new Date(task.endDate!),
        end: new Date(task.endDate!),
        task: task,
        id: task.id,
      }));
  }, [data]);
  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "PREV") {
      setValue(subMonths(value, 1));
    } else if (action === "NEXT") {
      setValue(addMonths(value, 1));
    } else if (action === "TODAY") {
      setValue(new Date());
    }
  };

  return (
    <Calendar
      localizer={localizer}
      date={value}
      events={events}
      views={["month"]}
      defaultView="month"
      toolbar
      showAllEvents
      className="h-full"
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      formats={{
        weekdayFormat: (date, culture, localizer) =>
          localizer?.format(date, "EEE", culture) ?? "",
      }}
      components={{
        eventWrapper: ({ event }) => <EventCard task={event.task} />,
        toolbar: () => (
          <CustomToolbar date={value} onNavigate={handleNavigate} />
        ),
      }}
    />
  );
};
