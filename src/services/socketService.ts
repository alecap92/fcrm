import { io } from "socket.io-client";
import { authService } from "../config/authConfig";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: {
    token: authService.getToken(),
  },
});

socket.on("connect", () => {
  // Socket conectado
});

socket.on("disconnect", (reason) => {
  // Socket desconectado
});

socket.on("connect_error", (error) => {
  console.error("Error de conexión del socket:", error);
});

socket.on("error", (error: Error) => {
  console.error("Error en la conexión del socket:", error);
});

// Función para reconectar con un nuevo token
export const reconnectWithNewToken = (token: string) => {
  socket.auth = { token };
  socket.disconnect().connect();
};

// Función para suscribirse a una conversación
export const subscribeToConversation = (conversationId: string) => {
  socket.emit("subscribe_to_conversation", { conversationId });
};

// Función para desuscribirse de una conversación
export const unsubscribeFromConversation = (conversationId: string) => {
  socket.emit("unsubscribe_from_conversation", { conversationId });
};

// Función para verificar el estado del socket
export const getSocketStatus = () => {
  return {
    connected: socket.connected,
    id: socket.id,
    auth: socket.auth,
    url: SOCKET_URL,
  };
};
