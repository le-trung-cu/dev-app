import { useParams } from "next/navigation";

export const useChannelId = () => {
  const { channelId } = useParams();
  return channelId as string;
};
