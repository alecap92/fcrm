import { io } from "socket.io-client";
import { authService } from "../config/authConfig";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

if (!SOCKET_URL) {
  throw new Error("VITE_SOCKET_URL is not defined");
}

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: {
    token: authService.getToken(),
  },
});

socket.on("connect", () => {});

socket.on("disconnect", (_reason) => {});

socket.on("connect_error", (error) => {
  console.error("Socket connect_error:", error);
});

socket.on("error", (error: Error) => {
  console.error("Socket error:", error);
});

// Agregar listeners para eventos específicos para debugging
socket.on("newMessage", (_data) => {});

socket.on("whatsapp_message", (_data) => {});

// Agregar listener para newNotification
socket.on("newNotification", (_data) => {});

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
  const wrappedListener = (...args: any[]) => listener(...args);
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
  return originalEmit(event, ...args);
};

// Interceptar todos los eventos que llegan (silencioso)
socket.onAny((_event: string, ..._args: any[]) => {});

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
  const status = {
    connected: socket.connected,
    id: socket.id,
    auth: socket.auth,
    url: SOCKET_URL,
  };
  return status;
};

// Función para unirse a una sala
export const joinRoom = (room: string) => {
  socket.emit("joinRoom", room);
};

// Función para salir de una sala
export const leaveRoom = (room: string) => {
  socket.emit("leaveRoom", room);
};
