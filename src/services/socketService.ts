import { io } from "socket.io-client";
import { authService } from "../config/authConfig";

// const SOCKET_URL = "http://localhost:3001"; // Temporalmente forzado a local
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

console.log("[DEBUG] Socket URL:", SOCKET_URL);
console.log("[DEBUG] Initial token:", authService.getToken());

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
  console.log("[DEBUG] Socket conectado exitosamente:", socket.id);
  console.log("[DEBUG] Socket auth:", socket.auth);
});

socket.on("disconnect", (reason) => {
  console.log("[DEBUG] Socket desconectado:", reason);
});

socket.on("connect_error", (error) => {
  console.error("[DEBUG] Error de conexión del socket:", error);
});

socket.on("error", (error: Error) => {
  console.error("[DEBUG] Error en la conexión del socket:", error);
});

// Agregar listeners para eventos específicos para debugging
socket.on("newMessage", (data) => {
  console.log("[DEBUG] Socket received newMessage:", data);
});

socket.on("whatsapp_message", (data) => {
  console.log("[DEBUG] Socket received whatsapp_message:", data);
});

// Agregar listener para newNotification
socket.on("newNotification", (data) => {
  console.log("[DEBUG] Socket received newNotification:", data);
});

// Mantener un mapa de listeners envueltos para poder removerlos correctamente
const __listenerMap: Map<
  string,
  Map<(...args: any[]) => void, (...args: any[]) => void>
> = new Map();

const getEventListenerMap = (event: string) => {
  if (!__listenerMap.has(event)) {
    __listenerMap.set(event, new Map());
  }
  return __listenerMap.get(event)!;
};

// Listener genérico para capturar cualquier evento
const originalOn = socket.on.bind(socket);
const originalOff = socket.off.bind(socket);

socket.on = function (event: string, listener: (...args: any[]) => void) {
  const wrappedListener = (...args: any[]) => {
    if (!["connect", "disconnect", "connect_error", "error"].includes(event)) {
      console.log(`[DEBUG] Socket event '${event}' received:`, args);
    }
    return listener(...args);
  };
  // Guardar el mapeo para permitir off(listener) posteriormente
  const eventMap = getEventListenerMap(event);
  eventMap.set(listener, wrappedListener);
  return originalOn(event, wrappedListener);
};

// Asegurar que off remueva el listener envuelto correspondiente
socket.off = function (event: string, listener?: (...args: any[]) => void) {
  if (listener) {
    const eventMap = getEventListenerMap(event);
    const wrapped = eventMap.get(listener);
    if (wrapped) {
      eventMap.delete(listener);
      return originalOff(event, wrapped);
    }
    // Si no encontramos el wrapper, intentar igualmente con el original
    return originalOff(event, listener);
  }
  // Si no pasaron listener, remover todos los de ese evento y limpiar mapa
  __listenerMap.delete(event);
  return originalOff(event);
};

// Listener genérico para capturar cualquier evento
const originalEmit = socket.emit.bind(socket);
socket.emit = function (event: string, ...args: any[]) {
  console.log(`[DEBUG] Socket emitting '${event}':`, args);
  return originalEmit(event, ...args);
};

// Interceptar todos los eventos que llegan
socket.onAny((event: string, ...args: any[]) => {
  console.log(`[DEBUG] Socket received event '${event}':`, args);
});

// Función para reconectar con un nuevo token
export const reconnectWithNewToken = (token: string) => {
  console.log("[DEBUG] Reconnecting with new token:", token);
  socket.auth = { token };
  socket.disconnect().connect();
};

// Función para suscribirse a una conversación
export const subscribeToConversation = (conversationId: string) => {
  console.log("[DEBUG] Subscribing to conversation:", conversationId);
  socket.emit("subscribe_to_conversation", { conversationId });
};

// Función para desuscribirse de una conversación
export const unsubscribeFromConversation = (conversationId: string) => {
  console.log("[DEBUG] Unsubscribing from conversation:", conversationId);
  socket.emit("unsubscribe_from_conversation", { conversationId });
};

// Función para verificar el estado del socket
export const getSocketStatus = () => {
  const status = {
    connected: socket.connected,
    id: socket.id,
    auth: socket.auth,
    url: SOCKET_URL,
  };
  console.log("[DEBUG] Socket status:", status);
  return status;
};

// Función para unirse a una sala
export const joinRoom = (room: string) => {
  console.log("[DEBUG] Joining room:", room);
  socket.emit("joinRoom", room);
};

// Función para salir de una sala
export const leaveRoom = (room: string) => {
  console.log("[DEBUG] Leaving room:", room);
  socket.emit("leaveRoom", room);
};
