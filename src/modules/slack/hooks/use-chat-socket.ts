// hooks/useSocket.ts
import { useSocket } from "@/components/providers/socket-provider";
import { useEffect } from "react";
import { useSetQueryDataMessages } from "../features/messages/api/use-get-messages";

type ChatSocketProps = {
  roomId: string;
};

export const useChatSocket = ({ roomId }: ChatSocketProps) => {
  const { socket } = useSocket();
  const { setCreatedMessage, setUpdatedMessage, setUpdateReaction } =
    useSetQueryDataMessages();

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("join-chat-room", roomId);
    socket.on("new-message", ({ message }: any) => {
      console.log({ ["new-message"]: message });
      setCreatedMessage(message);
    });

    socket.on("update-message", ({ message }: any) => {
      console.log({ ["update-message"]: message });
      setUpdatedMessage(message);
    });

    socket.on("update-reaction", ({ reaction }: any) => {
      console.log({ ["update-reaction"]: reaction });
      setUpdateReaction(reaction);
    });

    return () => {
      socket.off("new-message");
      socket.off("update-message");
    };
  }, [socket, roomId, setCreatedMessage, setUpdatedMessage, setUpdateReaction]);
};
