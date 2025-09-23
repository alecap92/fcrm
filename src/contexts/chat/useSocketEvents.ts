import { useCallback, useEffect } from "react";
import {
  socket,
  subscribeToConversation,
  unsubscribeFromConversation,
} from "../../services/socketService";
import { Message } from "../../types/chat";
import { Conversation, Pipeline } from "./types";
import { conversationService } from "../../services/conversationService";

export function useSocketEvents({
  userOrganizationId,
  currentChatId,
  conversations,
  pipeline,
  transformApiConversations,
  setMessages,
  updateConversationPreview,
  showNewMessageNotification,
}: {
  userOrganizationId?: string;
  currentChatId: string | null;
  conversations: Conversation[];
  pipeline: Pipeline | null;
  transformApiConversations: (
    apiConversations: any[],
    currentPipeline: Pipeline
  ) => Conversation[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  updateConversationPreview: (
    chatId: string,
    data: Partial<Conversation>
  ) => void;
  showNewMessageNotification: (senderName: string) => void;
}) {
  // Sala global por organización
  useEffect(() => {
    if (!userOrganizationId) return;
    const orgRoom = `organization_${userOrganizationId}`;
    socket.emit("joinRoom", orgRoom);
    return () => {
      socket.emit("leaveRoom", orgRoom);
    };
  }, [userOrganizationId]);

  const handleNewMessage = useCallback(
    (newMessage: any) => {
      // Limpieza de logs ruidosos
      let messageData;
      let chatId;
      if (newMessage.message && newMessage.conversationId) {
        messageData = newMessage.message;
        chatId = newMessage.conversationId;
      } else if (newMessage.conversation) {
        messageData = newMessage;
        chatId = newMessage.conversation;
      } else if (newMessage.type && newMessage.contact) {
        // Notificación simple
        showNewMessageNotification(newMessage.contact);
        return;
      } else {
        console.error("Formato de mensaje desconocido:", newMessage);
        return;
      }
      // Normalizar a string para comparaciones seguras
      chatId = chatId ? String(chatId) : chatId;

      if (messageData.direction === "incoming" && chatId !== currentChatId) {
        const senderName =
          messageData.possibleName ||
          conversations.find((conv) => conv.id === chatId)?.title ||
          messageData.from ||
          "Contacto";
        showNewMessageNotification(senderName);
      }
      if (chatId === currentChatId && currentChatId) {
        const formattedMessage: Message = {
          _id: messageData._id || Date.now().toString(),
          message: messageData.message,
          user: messageData.user || messageData.from,
          organization: messageData.organization || "",
          from: messageData.from,
          to: messageData.to,
          mediaUrl: messageData.mediaUrl || undefined,
          mediaId: messageData.mediaId || "",
          timestamp: messageData.timestamp || new Date().toISOString(),
          type: messageData.type || "text",
          direction: messageData.direction,
          // Si el chat está abierto, marcamos como leído de forma optimista
          isRead:
            messageData.direction === "incoming"
              ? true
              : messageData.isRead || false,
          possibleName: messageData.possibleName || "",
          replyToMessage: messageData.replyToMessage || null,
          messageId: messageData.messageId || "",
          reactions: messageData.reactions || [],
          conversation: chatId,
          filename: messageData.filename,
          mimeType: messageData.mimeType,
        } as any;
        // Intentar conciliar con mensaje en cola (queued/sending) y evitar duplicados exactos
        setMessages((prev) => {
          // conciliación silenciosa
          // Evitar duplicados por messageId o por combinación clave
          const alreadyExists = prev.some(
            (m) =>
              (m.messageId &&
                formattedMessage.messageId &&
                m.messageId === formattedMessage.messageId) ||
              (m.conversation === chatId &&
                m.message === formattedMessage.message &&
                m.timestamp === formattedMessage.timestamp &&
                m.direction === formattedMessage.direction &&
                m.type === formattedMessage.type)
          );
          if (alreadyExists) {
            // duplicado detectado, evitar anexar
            return prev;
          }
          const idx = prev.findIndex(
            (m) =>
              m.conversation === chatId &&
              m.direction === "outgoing" &&
              (m.status === "queued" || m.status === "sending") &&
              m.message === formattedMessage.message &&
              m.type === formattedMessage.type
          );
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = { ...formattedMessage, status: "sent" } as any;
            // reconciliado queued → sent
            return copy;
          }
          // anexar como nuevo
          return [...prev, formattedMessage];
        });
        if (messageData.direction === "incoming") {
          updateConversationPreview(chatId, { isRead: true });
          // Asegurar consistencia en backend sin bloquear UI
          (async () => {
            try {
              await conversationService.markConversationAsRead(chatId);
            } catch {}
          })();
        }
      }
      const exists = conversations.some((conv) => conv.id === chatId);
      if (exists) {
        updateConversationPreview(chatId, {
          lastMessage: messageData.message,
          lastMessageTimestamp:
            messageData.timestamp || new Date().toISOString(),
          lastMessageDirection: messageData.direction,
          isRead:
            messageData.direction === "outgoing" || chatId === currentChatId,
        });
      } else {
        (async () => {
          try {
            const response = await conversationService.getConversationById(
              chatId,
              { page: 1, limit: 1 }
            );
            if (response && response.conversation && pipeline) {
              transformApiConversations([response.conversation], pipeline);
              // No seteamos aquí; dejamos al contenedor manejar merge si lo necesita
            }
          } catch (err) {
            console.error(
              "[CHAT] No se pudo obtener la nueva conversación:",
              err
            );
          }
        })();
      }
    },
    [
      currentChatId,
      conversations,
      pipeline,
      transformApiConversations,
      setMessages,
      updateConversationPreview,
      showNewMessageNotification,
    ]
  );

  useEffect(() => {
    if (!userOrganizationId) return;
    socket.on("newMessage", handleNewMessage);
    socket.on("whatsapp_message", handleNewMessage);
    socket.on("newNotification", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("whatsapp_message", handleNewMessage);
      socket.off("newNotification", handleNewMessage);
    };
  }, [userOrganizationId, handleNewMessage]);

  useEffect(() => {
    if (!currentChatId) return;
    subscribeToConversation(currentChatId);
    return () => {
      unsubscribeFromConversation(currentChatId);
    };
  }, [currentChatId]);
}
