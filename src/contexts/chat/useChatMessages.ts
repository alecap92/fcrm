import { useCallback, useMemo, useRef, useState } from "react";
import { Message } from "../../types/chat";
import { ApiMessage } from "../../types/conversations";
import { conversationService } from "../../services/conversationService";
import chatService from "../../services/chatService";
import { groupMessagesByDate, getHoursDifference } from "../../lib";

export function useChatMessages() {
  const [message, setMessage] = useState("");
  const [conversationDetail, setConversationDetail] = useState<any | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isConversationExpired = useCallback(() => {
    if (messages.length === 0) return false;
    const lastMessage = messages[messages.length - 1];
    const hoursDiff = getHoursDifference(
      lastMessage.timestamp,
      new Date().toISOString()
    );
    return hoursDiff > 24;
  }, [messages]);

  const groupedMessages = useMemo(
    () => groupMessagesByDate(messages),
    [messages]
  );

  const loadMessages = useCallback(
    async (pageToLoad = 1, initial = false, chatId?: string) => {
      const targetChatId = chatId || currentChatId;
      if (!targetChatId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await conversationService.getConversationById(
          targetChatId,
          {
            page: pageToLoad,
            limit: 50,
          }
        );
        if (response && response.data) {
          if (pageToLoad === 1) {
            setConversationDetail(response.data);
          }
          const messagesArray = response.data.messages || [];
          const formattedMessages: Message[] = messagesArray.map(
            (apiMsg: ApiMessage) => ({
              _id: apiMsg._id,
              message: apiMsg.message,
              user: apiMsg.user,
              organization: apiMsg.organization,
              from: apiMsg.from,
              to: apiMsg.to,
              mediaUrl: apiMsg.mediaUrl || undefined,
              timestamp: apiMsg.timestamp,
              type: apiMsg.type,
              direction: apiMsg.direction,
              isRead: apiMsg.isRead,
              replyToMessage: apiMsg.replyToMessage,
              filename: (apiMsg as any).filename,
              mimeType: (apiMsg as any).mimeType,
            })
          );
          const pagination = response.data.pagination;
          const hasMoreMessages = pagination
            ? pagination.page < pagination.pages
            : false;
          setHasMore(hasMoreMessages);
          if (pageToLoad === 1) {
            setMessages(formattedMessages);
            setIsInitialLoad(true);
          } else {
            setMessages((prev) => [...formattedMessages, ...prev]);
            setIsInitialLoad(false);
          }
        } else {
          setError("No se pudo cargar la conversación");
        }
      } catch (err) {
        setError("Error al cargar la conversación");
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [currentChatId]
  );

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage);
    }
  }, [isLoading, hasMore, page, loadMessages]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !currentChatId) return;

    // Crear mensaje en cola sin bloquear el input
    const queuedId = `q_${Date.now()}`;

    const queuedMessage: Message = {
      _id: queuedId,
      message,
      user: "user",
      organization: "user",
      from: "user",
      to: "user",
      mediaUrl: null,
      mediaId: "",
      timestamp: new Date().toISOString(),
      type: "text",
      direction: "outgoing",
      isRead: false,
      possibleName: "",
      replyToMessage: null,
      messageId: "",
      reactions: [],
      conversation: currentChatId,
      status: "queued",
    } as any;
    setMessages((prev) => [...prev, queuedMessage]);
    setMessage("");

    // Envío asíncrono
    (async () => {
      try {
        const destinationPhone =
          conversationDetail?.conversation?.participants?.contact?.reference ||
          "";
        if (!destinationPhone)
          throw new Error("No se pudo determinar el número de destino");

        // Marcar como enviando
        setMessages((prev) =>
          prev.map((m) =>
            m._id === queuedId ? { ...m, status: "sending" } : m
          )
        );

        const messageData = {
          to: destinationPhone,
          message: queuedMessage.message,
          messageType: "text",
          type: "text",
          mediaUrl: "",
          caption: "",
          conversation: currentChatId,
        };
        const sent = await chatService.sendMessage(messageData);

        if (sent) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === queuedId
                ? {
                    ...m,
                    _id: sent._id || m._id,
                    messageId: sent.messageId || m.messageId,
                    timestamp: sent.timestamp || m.timestamp,
                    status: "sent",
                  }
                : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === queuedId ? { ...m, status: "error" } : m
            )
          );
        }
      } catch (err) {
        const status = (err as any)?.status || (err as any)?.response?.status;
        const messageText =
          (err as any)?.message || (err as any)?.response?.data?.error || "";

        // Caso común: backend devuelve 409 por mensaje duplicado (ya fue enviado)
        if (status === 409 || /duplicad/i.test(messageText)) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === queuedId
                ? {
                    ...m,
                    status: "sent",
                  }
                : m
            )
          );
          // Reconciliar contra backend para asegurar consistencia
          try {
            await loadMessages(1, true);
          } catch {}
          return;
        }

        // Errores de red o timeout: dejar en 'sending' a la espera del socket
        const isNetworkError =
          (err as any)?.code === "NETWORK_ERROR" || status === 0 || !status;
        if (isNetworkError) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === queuedId ? { ...m, status: "sending" } : m
            )
          );
          return;
        }

        // Error real
        setMessages((prev) =>
          prev.map((m) => (m._id === queuedId ? { ...m, status: "error" } : m))
        );
      }
    })();
  }, [message, currentChatId, conversationDetail]);

  const handlePriorityChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newPriority = e.target.value;
      try {
        if (!conversationDetail) return;
        setConversationDetail({
          ...conversationDetail,
          conversation: {
            ...conversationDetail.conversation,
            priority: newPriority,
          },
        });
        await conversationService.editConversation(
          conversationDetail.conversation._id,
          { priority: newPriority }
        );
      } catch (error) {
        console.error("Error al actualizar la prioridad:", error);
      }
    },
    [conversationDetail]
  );

  return {
    // state
    message,
    setMessage,
    conversationDetail,
    messages,
    page,
    hasMore,
    isLoading,
    isInitialLoad,
    error,
    isSubmitting,

    // refs
    textareaRef,

    // actions
    loadMessages,
    handleLoadMore,
    handleSendMessage,
    handlePriorityChange,

    // helpers
    isConversationExpired,
    groupedMessages,

    // internal state setters useful to parent
    setConversationDetail,
    setMessages,
    setPage,
    setHasMore,
    setIsLoading,
    setIsInitialLoad,
    setError,
    setIsSubmitting,
    currentChatId,
    setCurrentChatId,
  } as const;
}
