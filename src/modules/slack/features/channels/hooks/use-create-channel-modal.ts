import { ChannelType } from "@/generated/prisma-jira-database/jira-database-client-types";
import { useQueryState, parseAsBoolean } from "nuqs";
import { useState } from "react";
import { atom, useAtom } from "jotai";

const _initialValues = atom<{
  type: ChannelType;
} | null>(null);

export const useCreateChannelModal = () => {
  const [open, setOpen] = useQueryState(
    "create-channel",
    parseAsBoolean.withDefault(false)
  );
  const [initialValues, setInitialValues] = useAtom(_initialValues);

  return {
    open,
    setOpen: (
      open: boolean,
      initialValues: { type: ChannelType } | null = null
    ) => {
      setInitialValues(initialValues);
      setOpen(open);
    },
    initialValues,
  };
};
