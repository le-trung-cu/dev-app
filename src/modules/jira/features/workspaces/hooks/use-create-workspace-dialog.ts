import {useQueryState, parseAsBoolean} from "nuqs";

export const useCreateWorkspaceDialog = () => {
  const [open, setOpen] = useQueryState('create-workspace', parseAsBoolean.withDefault(false));

  return {
    open,
    setOpen,
  }
}