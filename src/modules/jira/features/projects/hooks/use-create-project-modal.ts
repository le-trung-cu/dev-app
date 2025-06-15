import {useQueryState, parseAsBoolean} from "nuqs";

export const useCreateProjectModal = () => {
  const [open, setOpen] = useQueryState('create-project', parseAsBoolean.withDefault(false));

  return {
    open,
    setOpen,
  }
}