import { Message } from "../types/chat";
import { formatDate } from "./dateUtils";

/**
 * Agrupa mensajes por fecha
 */
export const groupMessagesByDate = (
  messages: Message[]
): { date: string; messages: Message[] }[] => {
  // Primero ordenar los mensajes cronológicamente (más antiguos primero)
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = "";

  sortedMessages.forEach((message) => {
    const messageDate = formatDate(message.timestamp);

    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groupedMessages.push({
        date: messageDate,
        messages: [message],
      });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(message);
    }
  });

  return groupedMessages;
};

/**
 * Verifica si un mensaje es de tipo multimedia
 */
export const isMediaMessage = (message: Message): boolean => {
  return ["image", "document", "audio", "video"].includes(message.type);
};

/**
 * Obtiene la URL de media de un mensaje si existe
 */
export const getMessageMediaUrl = (message: Message): string | null => {
  return message.mediaUrl || null;
};

/**
 * Verifica si un mensaje es entrante
 */
export const isIncomingMessage = (message: Message): boolean => {
  return message.direction === "incoming";
};

/**
 * Verifica si un mensaje es saliente
 */
export const isOutgoingMessage = (message: Message): boolean => {
  return message.direction === "outgoing";
};

/**
 * Obtiene el texto del mensaje, manejando diferentes tipos
 */
export const getMessageText = (message: Message): string => {
  if (message.type === "text") {
    return message.message;
  }

  // Para mensajes multimedia, retornar un texto descriptivo si no hay mensaje
  if (isMediaMessage(message) && !message.message) {
    switch (message.type) {
      case "image":
        return "📷 Imagen";
      case "document":
        return "📄 Documento";
      case "audio":
        return "🎵 Audio";
      case "video":
        return "🎥 Video";
      default:
        return "📎 Archivo adjunto";
    }
  }

  return message.message;
};

/**
 * Filtra mensajes por tipo
 */
export const filterMessagesByType = (
  messages: Message[],
  type: string
): Message[] => {
  return messages.filter((message) => message.type === type);
};

/**
 * Filtra mensajes por dirección
 */
export const filterMessagesByDirection = (
  messages: Message[],
  direction: "incoming" | "outgoing"
): Message[] => {
  return messages.filter((message) => message.direction === direction);
};

/**
 * Obtiene el último mensaje de una conversación
 */
export const getLastMessage = (messages: Message[]): Message | null => {
  if (messages.length === 0) return null;
  return messages[messages.length - 1];
};

/**
 * Cuenta mensajes no leídos
 */
export const countUnreadMessages = (messages: Message[]): number => {
  return messages.filter(
    (message) => !message.isRead && message.direction === "incoming"
  ).length;
};
