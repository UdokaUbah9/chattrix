import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || NEXT_PUBLIC_SERVER_URL;

// This ensures we only have ONE connection for the whole app

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  timeout: 10000,
  autoConnect: false,
  reconnection: true, // Crucial for refresh resiliencemanually connect when the user logs in
  withCredentials: true,
});
