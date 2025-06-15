import { useQueryState, parseAsInteger } from "nuqs";

export const useEditTaskModal = () => {
  const [taskId, setTaskId] = useQueryState("edit-task", parseAsInteger);

  return {
    isOpen: taskId !== null,
    taskId,
    setTaskId,
    close: () => setTaskId(null),
  };
};
