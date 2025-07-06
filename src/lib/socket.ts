import { Server as NetServer } from "http";
import { Server as IOServer } from "socket.io";

let io: IOServer | null = null;

export const initSocketServer = (server: NetServer) => {
  if (!io) {
    io = new IOServer(server, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      console.log("Client connected", socket.id);

      socket.on("join-chat-room", (roomId: string) => {
        console.log("join-chat-room")
        for(const room of socket.rooms) {
          if(room.startsWith("chat-room:")) {
            socket.leave(room);
          }
        }
        socket.join(`chat-room:${roomId}`);
        console.log(`Socket ${socket.id} joined chat-room:${roomId}`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
      });
    });
  }

  return io;
};

export const getSocketServer = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
