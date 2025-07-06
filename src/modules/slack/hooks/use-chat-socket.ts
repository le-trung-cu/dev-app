// hooks/useSocket.ts
import { useSocket } from "@/components/providers/socket-provider";
import { client } from "@/lib/rpc";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSetQueryDataMessages } from "../features/messages/api/use-get-messages";
import { Message } from "../features/messages/types";

type ChatSocketProps = {
  roomId: string;
  updateKey: string;
  queryKey: string;
};

export const useChatSocket = ({ roomId, updateKey }: ChatSocketProps) => {
  const { socket } = useSocket();
  const { setCreatedMessage, setUpdatedMessage } = useSetQueryDataMessages();

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("join-chat-room", roomId);
    socket.on("new-message", ({ message }: { message: Message }) => {
      console.log({ ["new-message"]: message });
      setCreatedMessage(message);
    });

    socket.on("update-message", ({ message }: { message: Message }) => {
      console.log({ ["update-message"]: message });
      setUpdatedMessage(message);
    });

    return () => {
      socket.off("new-message");
      socket.off("update-message");
    };
  }, [socket, roomId, setCreatedMessage, setUpdatedMessage]);
};
