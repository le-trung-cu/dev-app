import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

export const useEditChannelModal = () => {
  const [channelId, setChannelId] = useQueryState("edit-channel", parseAsString);

  return {
    isOpen: channelId !== null,
    channelId: channelId,
    setChannelId: setChannelId,
    close: () => setChannelId(null),
  };
};
