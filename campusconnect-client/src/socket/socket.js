import { io } from "socket.io-client";

let socket = null;

export function connectSocket(userId) {
  const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
  socket = io(url, { query: { userId } });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
  socket = null;
}
