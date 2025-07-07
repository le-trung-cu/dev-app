import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

export const useEditTaskModal = () => {
  const [taskId, setTaskId] = useQueryState("edit-task", parseAsString);

  return {
    isOpen: taskId !== null,
    taskId,
    setTaskId,
    close: () => setTaskId(null),
  };
};
