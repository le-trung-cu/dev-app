import { useParams } from "next/navigation";

export const useChannelId = () => {
  const { channelId } = useParams() as any;
  return channelId as string;
};
