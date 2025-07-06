"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

type SocketContextType = {
  socket: ReturnType<typeof io> | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<SocketContextType["socket"]>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_APP_URL, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    socket.on("connect", () => {
      console.log("connect WS");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("disconnect WS");
      setIsConnected(false);
    });

    socket.on("error", (e) => {
      console.log("error WS", e);
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
