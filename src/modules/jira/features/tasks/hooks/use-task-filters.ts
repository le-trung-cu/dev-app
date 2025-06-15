import { TaskStatus } from "@/generated/prisma-jira-database/jira-database-client-types";
import { useQueryStates, parseAsString, parseAsStringEnum } from "nuqs";

export const useTaskFilters = () => {
  const [filters, _setFilters] = useQueryStates({
    projectId: parseAsString.withDefault(""),
    assigneeId: parseAsString.withDefault(""),
    status: parseAsString.withDefault(""),
    endDate: parseAsString.withDefault(""),
  });

  const setFilters = (name: string, value: string) => {
    _setFilters((old) => ({
      ...old,
      [name]: value,
    }));
  };

  return [filters, setFilters] as const;
};
