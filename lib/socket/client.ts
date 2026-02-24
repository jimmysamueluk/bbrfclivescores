"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket.IO connected");
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket.IO disconnected");
    });
  }

  return socket;
};

export const joinGameRoom = (gameId: number) => {
  const socket = getSocket();
  socket.emit("join-game", gameId.toString());
  console.log(`📍 Joined game room: ${gameId}`);
};

export const leaveGameRoom = (gameId: number) => {
  const socket = getSocket();
  socket.emit("leave-game", gameId.toString());
  console.log(`🚪 Left game room: ${gameId}`);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
