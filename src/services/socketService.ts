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
  console.log("Conectado al servidor de socket");
  console.log("[Socket] Conectado al servidor", {
    socketId: socket.id,
    timestamp: new Date().toISOString(),
    auth: socket.auth, // Verificar que el token se está enviando
  });
});

socket.on("disconnect", () => {
  console.log("Desconectado del servidor de socket");
});

socket.on("error", (error: Error) => {
  console.error("Error en la conexión del socket:", error);
});

// Agregar listener para todos los eventos
socket.onAny((eventName, ...args) => {
  console.log(`[Socket] Evento recibido: ${eventName}`, {
    args,
    timestamp: new Date().toISOString(),
  });
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
