import {useQueryState, parseAsBoolean} from "nuqs";

export const useCreateTaskModal = () => {
  const [open, setOpen] = useQueryState('create-task', parseAsBoolean.withDefault(false));

  return {
    open,
    setOpen,
  }
}