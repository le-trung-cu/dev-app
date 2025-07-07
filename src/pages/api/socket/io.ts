// pages/api/socket.ts
import { NextApiRequest, NextApiResponse } from "next";
import { initSocketServer } from "@/lib/socket";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    console.log("Initializing Socket.IO...");
    initSocketServer((res as any).socket.server);
    (res.socket as any).server.io = true;
  }
  res.end();
}
