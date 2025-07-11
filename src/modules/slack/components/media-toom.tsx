"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { Loader2 } from "lucide-react";
import { useGetCurrent } from "@/modules/auth/api/use-get-current";

interface MediaRoomProps {
  chatId: string;
  video?: boolean;
  audio?: boolean;
}

export const MediaRoom = ({
  chatId,
  video = false,
  audio = false,
}: MediaRoomProps) => {
  const { data: current } = useGetCurrent();
  const user = current?.user;
  const [token, setToken] = useState("");
  useEffect(() => {
    if (!user?.name) return;

    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=${chatId}&username=${user.name}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [user?.name, chatId]);

  if (token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};
