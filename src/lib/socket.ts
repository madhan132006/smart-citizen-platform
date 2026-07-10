import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (userId?: string): Socket => {
  if (!socket) {
    socket = io(); // Connects to the same server URL
    if (userId) {
      socket.emit("join", userId);
    }
  }
  return socket;
};
