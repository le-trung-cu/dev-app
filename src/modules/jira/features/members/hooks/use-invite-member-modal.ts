import {useQueryState, parseAsBoolean} from "nuqs";

export const useInviteMemberModal = () => {
  const [open, setOpen] = useQueryState('invite-member', parseAsBoolean.withDefault(false));

  return {
    open,
    setOpen,
  }
}