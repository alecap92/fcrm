import React, {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { useLoading } from "./LoadingContext";
import { useKanbanConversations } from "./chat/useKanbanConversations";
import { useChatMessages } from "./chat/useChatMessages";
import { useAttachments } from "./chat/useAttachments";
import { useSocketEvents } from "./chat/useSocketEvents";
import { ChatContextType } from "./chat/types";
import { socket } from "../services/socketService";

interface ChatProviderProps {
  children: ReactNode;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context)
    throw new Error("useChatContext debe ser usado dentro de un ChatProvider");
  return context;
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { showNewMessageNotification, restoreTitle } = usePageTitle({
    defaultTitle: "FusionCRM",
    blinkInterval: 2000,
    blinkDuration: 15000,
    soundEnabled: true,
    soundVolume: 0.6,
  });

  // Mensajería
  const {
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
    textareaRef,
    loadMessages,
    handleLoadMore,
    handleSendMessage,
    handlePriorityChange,
    isConversationExpired,
    groupedMessages,
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
  } = useChatMessages();

  // Kanban/pipeline
  const {
    conversations,
    columns,
    pipeline,
    conversationsError,
    searchResults,
    isLoadingConversations,
    columnLoadingStates,
    fetchConversations,
    fetchPipeline,
    updateConversationStage,
    markConversationAsRead,
    deleteConversation,
    searchConversations,
    loadMoreConversationsForColumn,
    editColumn,
    removeColumn,
    addColumn,
    refreshConversations,
    transformApiConversations,
    conversationsByColumn,
    truncateMessage,
    setColumns,
    isInitialPipelineLoad,
    hasAttemptedPipelineLoad,
    setHasAttemptedPipelineLoad,
    updateConversationPreview,
  } = useKanbanConversations({
    onShowLoading: showLoading,
    onHideLoading: hideLoading,
  });

  // Adjuntos
  const {
    isUploadingFile,
    uploadError,
    clearUploadError,
    handleAttachmentClick,
    handleLibraryUpload,
    sendFile,
  } = useAttachments({
    getDestinationPhone: () =>
      conversationDetail?.conversation?.participants?.contact?.reference || "",
    getCurrentChatId: () => currentChatId,
    reloadMessages: async () => {
      if (conversationDetail) await loadMessages(1, true);
    },
    refreshConversations,
  });

  // La actualización de preview viene del hook de Kanban

  // Socket
  useSocketEvents({
    userOrganizationId: user?.organizationId,
    currentChatId,
    conversations,
    pipeline,
    transformApiConversations,
    setMessages,
    updateConversationPreview,
    showNewMessageNotification,
  });

  // Inicialización y limpieza de chat
  const initializeChat = useCallback(
    (chatId: string, isOpen: boolean) => {
      if (isOpen && chatId) {
        restoreTitle();
        setCurrentChatId(chatId);
        setPage(1);
        setHasMore(true);
        setIsInitialLoad(true);
        setError(null);
        setIsLoading(true);
        loadMessages(1, true, chatId);
      }
    },
    [
      restoreTitle,
      setCurrentChatId,
      setPage,
      setHasMore,
      setIsInitialLoad,
      setError,
      setIsLoading,
      loadMessages,
    ]
  );

  const cleanupChat = useCallback(() => {
    setCurrentChatId(null);
    setMessages([]);
    setConversationDetail(null);
    setMessage("");
    setError(null);
    setIsLoading(false);
    setIsInitialLoad(true);
    setPage(1);
    setHasMore(true);
  }, [
    setCurrentChatId,
    setMessages,
    setConversationDetail,
    setMessage,
    setError,
    setIsLoading,
    setIsInitialLoad,
    setPage,
    setHasMore,
  ]);

  // Debug helpers
  const checkSocketStatus = useCallback(() => {
    const status = {
      connected: socket.connected,
      id: socket.id,
      url: import.meta.env.VITE_SOCKET_URL || "http://localhost:3001",
      organizationId: user?.organizationId,
      currentChatId,
      conversationsCount: conversations.length,
    };
    return status;
  }, [user?.organizationId, currentChatId, conversations.length]);

  const forceSocketReconnect = useCallback(() => {
    socket.disconnect();
    setTimeout(() => socket.connect(), 1000);
  }, []);

  const testSocket = useCallback(() => {
    if (user?.organizationId) {
      const orgRoom = `organization_${user.organizationId}`;
      socket.emit("joinRoom", orgRoom);
      socket.emit("test_event", {
        message: "Test from frontend",
        timestamp: new Date().toISOString(),
        organizationId: user.organizationId,
      });
    }
  }, [user?.organizationId]);

  const value: ChatContextType = useMemo(
    () => ({
      // Estado del chat individual
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
      isUploadingFile,
      uploadError,
      clearUploadError,

      // Estado de conversaciones y pipeline
      conversations,
      columns,
      pipeline,
      conversationsError,
      searchResults,
      isLoadingConversations,
      columnLoadingStates,

      // Referencias
      textareaRef,

      // Funciones del chat individual
      loadMessages,
      handleLoadMore,
      handleSendMessage,
      handlePriorityChange,
      handleAttachmentClick,
      handleLibraryUpload,
      sendFile,

      // Funciones de gestión de conversaciones
      fetchConversations,
      fetchPipeline,
      updateConversationStage,
      markConversationAsRead,
      deleteConversation,
      searchConversations,
      transformApiConversations,
      loadMoreConversationsForColumn,

      // Funciones de gestión de columnas/pipeline
      editColumn,
      removeColumn,
      addColumn,
      setColumns,

      // Funciones de utilidad
      isConversationExpired,
      groupedMessages,
      conversationsByColumn,
      truncateMessage,

      // Funciones de inicialización y limpieza
      initializeChat,
      cleanupChat,
      refreshConversations,

      // Funciones de debug
      checkSocketStatus,
      forceSocketReconnect,
      testSocket,
    }),
    [
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
      isUploadingFile,
      uploadError,
      clearUploadError,
      conversations,
      columns,
      pipeline,
      conversationsError,
      searchResults,
      isLoadingConversations,
      columnLoadingStates,
      textareaRef,
      loadMessages,
      handleLoadMore,
      handleSendMessage,
      handlePriorityChange,
      handleAttachmentClick,
      handleLibraryUpload,
      sendFile,
      fetchConversations,
      fetchPipeline,
      updateConversationStage,
      markConversationAsRead,
      deleteConversation,
      searchConversations,
      transformApiConversations,
      loadMoreConversationsForColumn,
      editColumn,
      removeColumn,
      addColumn,
      setColumns,
      isConversationExpired,
      groupedMessages,
      conversationsByColumn,
      truncateMessage,
      initializeChat,
      cleanupChat,
      refreshConversations,
      checkSocketStatus,
      forceSocketReconnect,
      testSocket,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
