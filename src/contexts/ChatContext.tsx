import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { conversationService } from "../services/conversationService";
import chatService from "../services/chatService";
import fileService from "../services/filesService";
import {
  socket,
  subscribeToConversation,
  unsubscribeFromConversation,
} from "../services/socketService";
import { Message } from "../types/chat";
import { ApiMessage } from "../types/conversations";
import type { FileDocument } from "../services/filesService";
import { groupMessagesByDate, getHoursDifference } from "../lib";
import { useAuth } from "./AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { useLoading } from "./LoadingContext";

// Interfaces para conversaciones y pipelines
interface ApiConversation {
  _id: string;
  title: string;
  organization: string;
  mobile?: string;
  participants: {
    user: {
      reference: string;
      type: "User";
    };
    contact: {
      reference: string;
      type: "Contact";
      contactId: string;
      displayInfo?: {
        mobile: string;
        name: string;
        lastName: string;
        email: string;
        position: string;
        contactId: string;
      };
    };
  };
  unreadCount: number;
  pipeline: string;
  currentStage: number;
  assignedTo: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  isResolved: boolean;
  priority: string;
  tags: string[];
  firstContactTimestamp: string;
  metadata: Array<{
    key: string;
    value: string;
    _id: string;
  }>;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessage: any;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  priority: string;
  status: string;
  assignedTo: string;
  tags: string[];
  createdAt: string;
  isRead: boolean;
  mobile?: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

interface PipelineStage {
  stageId: string;
  stageName: string;
  stageOrder: number;
  stageColor: string;
  conversations: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

interface Pipeline {
  pipeline: {
    id: string;
    name: string;
    isDefault: boolean;
  };
  stages: PipelineStage[];
}

interface ChatContextType {
  // Estado del chat individual
  message: string;
  setMessage: (message: string) => void;
  conversationDetail: any | null;
  messages: Message[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isInitialLoad: boolean;
  error: string | null;
  isSubmitting: boolean;
  isUploadingFile: boolean;
  uploadError: string | null;
  clearUploadError: () => void;

  // Estado de conversaciones y pipeline
  conversations: Conversation[];
  columns: Column[];
  pipeline: Pipeline | null;
  conversationsError: string | null;
  searchResults: Conversation[];
  isLoadingConversations: boolean;
  columnLoadingStates: Record<string, boolean>;

  // Referencias
  textareaRef: React.RefObject<HTMLTextAreaElement>;

  // Funciones del chat individual
  loadMessages: (
    pageToLoad?: number,
    initial?: boolean,
    chatId?: string
  ) => Promise<void>;
  handleLoadMore: () => void;
  handleSendMessage: () => Promise<void>;
  handlePriorityChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => Promise<void>;
  handleAttachmentClick: (file: File) => void;
  handleLibraryUpload: (document: FileDocument) => Promise<void>;
  sendFile: (formData: FormData) => Promise<void>;

  // Funciones de gestión de conversaciones
  fetchConversations: (currentPipeline?: Pipeline | null) => Promise<void>;
  fetchPipeline: () => Promise<void>;
  updateConversationStage: (chatId: string, newStage: number) => Promise<void>;
  markConversationAsRead: (chatId: string, mobile?: string) => Promise<void>;
  deleteConversation: (chatId: string) => Promise<void>;
  searchConversations: (searchTerm: string) => Promise<void>;
  transformApiConversations: (
    apiConversations: ApiConversation[],
    currentPipeline: Pipeline
  ) => Conversation[];
  loadMoreConversationsForColumn: (columnId: string) => Promise<void>;

  // Funciones de gestión de columnas/pipeline
  editColumn: (columnId: string, title: string, color: string) => Promise<void>;
  removeColumn: (columnId: string) => void;
  addColumn: (title: string, color: string) => void;
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;

  // Funciones de utilidad
  isConversationExpired: () => boolean;
  groupedMessages: { date: string; messages: Message[] }[];
  conversationsByColumn: Record<string, Conversation[]>;
  truncateMessage: (message: string, maxLength?: number) => string;

  // Funciones de inicialización y limpieza
  initializeChat: (chatId: string, isOpen: boolean) => void;
  cleanupChat: () => void;
  refreshConversations: () => void;

  // Funciones de debug
  checkSocketStatus: () => any;
  forceSocketReconnect: () => void;
  testSocket: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext debe ser usado dentro de un ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // Obtener información del usuario autenticado
  const { user } = useAuth();

  // Hook para manejar el título de la página
  const { showNewMessageNotification, restoreTitle, testSound } = usePageTitle({
    defaultTitle: "FusionCRM",
    blinkInterval: 2000,
    blinkDuration: 15000,
    soundEnabled: true, // Habilitar sonidos de notificación
    soundVolume: 0.6, // Volumen moderado
  });

  // Hook de loading global
  const { showLoading, hideLoading } = useLoading();

  // Estado del chat individual
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
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Estado de conversaciones y pipeline
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [conversationsError, setConversationsError] = useState<string | null>(
    null
  );
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [columnLoadingStates, setColumnLoadingStates] = useState<
    Record<string, boolean>
  >({});

  // Nuevo estado para controlar la primera carga
  const [isInitialPipelineLoad, setIsInitialPipelineLoad] = useState(true);
  const [hasAttemptedPipelineLoad, setHasAttemptedPipelineLoad] =
    useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Referencias
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Efecto para resetear el estado cuando no hay chat activo
  useEffect(() => {
    if (!currentChatId) {
      setIsLoading(false);
      setError(null);
    }
  }, [currentChatId]);

  // Función para verificar si la conversación ha expirado
  const isConversationExpired = useCallback(() => {
    if (messages.length === 0) return false;

    const lastMessage = messages[messages.length - 1];
    const hoursDiff = getHoursDifference(
      lastMessage.timestamp,
      new Date().toISOString()
    );

    return hoursDiff > 24;
  }, [messages]);

  // Mensajes agrupados por fecha
  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

  // Función para transformar conversaciones de API a formato local
  const transformApiConversations = useCallback(
    (
      apiConversations: ApiConversation[],
      currentPipeline: Pipeline
    ): Conversation[] => {
      return apiConversations.map((conv: ApiConversation) => {
        const stageId =
          currentPipeline.stages[conv.currentStage]?.stageId || "";

        // Obtener el nombre del contacto si está disponible
        const contactDisplayInfo = conv.participants?.contact?.displayInfo;
        const contactName = contactDisplayInfo?.name
          ? `${contactDisplayInfo.name} ${
              contactDisplayInfo.lastName || ""
            }`.trim()
          : conv.title || conv.participants?.contact?.reference || "Sin nombre";

        return {
          id: conv._id,
          title: contactName,
          lastMessage: conv.lastMessage?.message || "",
          priority: conv.priority,
          status: stageId,
          assignedTo:
            conv.assignedTo?.firstName + " " + conv.assignedTo?.lastName ||
            "Sin asignar",
          tags: conv.tags,
          createdAt: conv.lastMessage?.timestamp || conv.createdAt,
          isRead: conv.lastMessage?.isRead || false,
          mobile: conv.mobile || conv.participants?.contact?.reference,
        };
      });
    },
    []
  );

  // Función para obtener conversaciones sin mostrar loading global
  const fetchConversations = useCallback(
    async (currentPipeline: Pipeline | null = null) => {
      try {
        if (!currentPipeline) return;

        setIsLoadingConversations(true);

        // Cargar cada columna individualmente
        const allConversations: Conversation[] = [];

        for (const stage of currentPipeline.stages) {
          const response = await conversationService.getConversationsByStage(
            currentPipeline.pipeline.id,
            stage.stageId,
            1,
            50
          );

          if (response.success && response.data) {
            const formattedConversations = transformApiConversations(
              response.data.conversations,
              currentPipeline
            );

            allConversations.push(...formattedConversations);

            // Actualizar la paginación de la columna
            setColumns((prevColumns) =>
              prevColumns.map((col) =>
                col.id === stage.stageId
                  ? {
                      ...col,
                      pagination: response.data.pagination,
                    }
                  : col
              )
            );
          }
        }

        setConversations(allConversations);
        setConversationsError(null);
      } catch (error) {
        console.error("DEBUG Fetch error:", error);
        setConversationsError("Error al cargar las conversaciones");
      } finally {
        setIsLoadingConversations(false);
      }
    },
    [transformApiConversations]
  );

  // Función para obtener pipeline
  const fetchPipeline = useCallback(async () => {
    // Solo mostrar loading si no es un retry
    if (isInitialPipelineLoad) {
      setIsLoadingConversations(true);
      showLoading("Cargando pipeline...");
    }

    setConversationsError(null);
    setHasAttemptedPipelineLoad(true);

    try {
      // Primero obtener el pipeline predeterminado
      const defaultPipelineResponse =
        await conversationService.getDefaultPipeline();

      if (!defaultPipelineResponse.success || !defaultPipelineResponse.data) {
        throw new Error("No se pudo obtener el pipeline predeterminado");
      }

      const defaultPipelineId = defaultPipelineResponse.data._id;

      // Luego obtener los datos completos del pipeline con conversaciones
      const pipelineResponse = await conversationService.getPipelineById(
        defaultPipelineId,
        { page: 1, limit: 10 }
      );

      // Verificar si la respuesta existe y tiene la estructura esperada
      if (
        pipelineResponse &&
        pipelineResponse.success &&
        pipelineResponse.data
      ) {
        const newPipeline = pipelineResponse.data;
        setPipeline(newPipeline);

        const pipelineColumns = newPipeline.stages.map(
          (stage: PipelineStage) => ({
            id: stage.stageId,
            title: stage.stageName,
            color: stage.stageColor,
            pagination: stage.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              pages: 0,
              hasMore: false,
            },
          })
        );

        setColumns(pipelineColumns);
        await fetchConversations(newPipeline);

        // Limpiar errores y retry count si la carga fue exitosa
        setConversationsError(null);
        setRetryCount(0);
      } else {
        console.error("Respuesta inválida del pipeline:", pipelineResponse);

        // Si es un error de conexión y no hemos reintentado muchas veces, retry automático
        if (
          retryCount < 3 &&
          (!pipelineResponse ||
            pipelineResponse.error === "Error de conexión al servidor")
        ) {
          console.log(
            `Reintentando carga del pipeline (intento ${retryCount + 1}/3)...`
          );
          setRetryCount((prev) => prev + 1);

          retryTimeoutRef.current = setTimeout(() => {
            fetchPipeline();
          }, 2000 * (retryCount + 1)); // Incrementar delay con cada retry

          return; // No establecer error aún
        }

        setConversationsError(
          "No se pudo cargar el pipeline - respuesta inválida del servidor"
        );
      }
    } catch (err) {
      console.error("Error al cargar el pipeline:", err);

      // Si es un error de conexión y no hemos reintentado muchas veces, retry automático
      if (retryCount < 3) {
        console.log(
          `Reintentando carga del pipeline (intento ${retryCount + 1}/3)...`
        );
        setRetryCount((prev) => prev + 1);

        retryTimeoutRef.current = setTimeout(() => {
          fetchPipeline();
        }, 2000 * (retryCount + 1)); // Incrementar delay con cada retry

        return; // No establecer error aún
      }

      setConversationsError(
        "Error de conexión - no se pudo cargar el pipeline"
      );
    } finally {
      hideLoading();
      setIsLoadingConversations(false);
      setIsInitialPipelineLoad(false);
    }
  }, [
    fetchConversations,
    isInitialPipelineLoad,
    retryCount,
    showLoading,
    hideLoading,
  ]);

  // Función para actualizar conversación
  const updateConversationStage = useCallback(
    async (chatId: string, newStage: number) => {
      try {
        await conversationService.editConversation(chatId, {
          currentStage: newStage,
        });

        setConversations((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id === chatId) {
              const stageId = pipeline?.stages[newStage]?.stageId || "";
              return { ...chat, status: stageId };
            }
            return chat;
          })
        );
      } catch (error) {
        console.error(
          "Error al actualizar la etapa de la conversación:",
          error
        );
        throw error; // Re-lanzar para que el componente pueda manejar el error
      }
    },
    [pipeline]
  );

  // Función para marcar como leído
  const markConversationAsRead = useCallback(
    async (chatId: string, mobile?: string) => {
      if (mobile) {
        await chatService.markAsRead(mobile);
      }

      setConversations((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId ? { ...chat, isRead: true } : chat
        )
      );
    },
    []
  );

  // Función para eliminar conversación
  const deleteConversation = useCallback(async (chatId: string) => {
    await conversationService.deleteConversation(chatId);
    setConversations((prev) => prev.filter((chat) => chat.id !== chatId));
  }, []);

  // Función para buscar conversaciones
  const searchConversations = useCallback(async (searchTerm: string) => {
    try {
      const response = await conversationService.searchConversations(
        searchTerm
      );
      setSearchResults(response.mensajes || []);
    } catch (error) {
      console.error("Error al buscar conversaciones:", error);
      setSearchResults([]);
    }
  }, []);

  // Función para convertir clases de Tailwind a colores HEX
  const convertTailwindBgClassToHex = useMemo(() => {
    const colorMap: Record<string, string> = {
      "bg-gray-100": "#E5E7EB",
      "bg-blue-50": "#EFF6FF",
      "bg-blue-500": "#4287f5",
      "bg-blue-300": "#42c5f5",
      "bg-red-50": "#FEF2F2",
      "bg-red-500": "#f54242",
      "bg-green-50": "#F0FDF4",
      "bg-green-400": "#42f584",
      "bg-yellow-50": "#FFFBEB",
      "bg-yellow-400": "#f5f542",
      "bg-orange-400": "#f5a442",
      "bg-purple-50": "#FAF5FF",
      "bg-purple-500": "#f542f5",
      "bg-pink-50": "#FDF2F8",
      "bg-indigo-50": "#EEF2FF",
    };

    return (tailwindClass: string): string => {
      return colorMap[tailwindClass] || "#4287f5";
    };
  }, []);

  // Función para editar columna
  const editColumn = useCallback(
    async (columnId: string, title: string, color: string) => {
      if (!pipeline || !user?.organizationId) return;

      const stageIndex = pipeline.stages.findIndex(
        (stage) => stage.stageId === columnId
      );
      if (stageIndex === -1) return;

      const hexColor = convertTailwindBgClassToHex(color);

      try {
        const updatedStages = pipeline.stages.map((stage) => {
          if (stage.stageId === columnId) {
            return { ...stage, stageName: title, stageColor: hexColor };
          }
          return stage;
        });

        const pipelineUpdateData = {
          name: pipeline.pipeline.name,
          organization: user.organizationId,
          stages: updatedStages.map((stage) => ({
            name: stage.stageName,
            order: stage.stageOrder,
            color: stage.stageColor,
            autoAssign: false,
            assignToTeam: null,
            _id: stage.stageId,
          })),
          isDefault: pipeline.pipeline.isDefault || true,
        };

        await conversationService.updateConversationPipeline(
          pipeline.pipeline.id,
          pipelineUpdateData
        );

        setColumns((prev) =>
          prev.map((col) =>
            col.id === columnId ? { ...col, title, color } : col
          )
        );
      } catch (error) {
        console.error("Error al actualizar la columna:", error);
        throw error; // Re-lanzar para que el componente pueda manejar el error
      }
    },
    [pipeline, convertTailwindBgClassToHex, user?.organizationId]
  );

  // Función para remover columna
  const removeColumn = useCallback((columnId: string) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
  }, []);

  // Función para agregar columna
  const addColumn = useCallback((title: string, color: string) => {
    const newColumn: Column = {
      id: title.toLowerCase().replace(/\s+/g, "_"),
      title,
      color,
    };
    setColumns((prev) => [...prev, newColumn]);
  }, []);

  // Agrupar conversaciones por columna
  const conversationsByColumn = useMemo(() => {
    const groupedConversations: Record<string, Conversation[]> = {};

    columns.forEach((column) => {
      groupedConversations[column.id] = conversations.filter(
        (chat) => chat.status === column.id
      );
    });

    return groupedConversations;
  }, [conversations, columns]);

  // Función para truncar mensajes
  const truncateMessage = useCallback(
    (message: string, maxLength: number = 50) => {
      return message.length > maxLength
        ? `${message.substring(0, maxLength)}...`
        : message;
    },
    []
  );

  // Función para limpiar errores de upload
  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  // Función para refrescar conversaciones con debounce
  const refreshConversations = useCallback(async () => {
    try {
      if (pipeline) {
        // Si ya tenemos el pipeline cargado, actualizamos solo las conversaciones
        await fetchConversations(pipeline);
      } else {
        // Si no hay pipeline, volvemos a cargarlo (esto también carga las conversaciones)
        await fetchPipeline();
      }
    } catch (error) {
      console.error("[CHAT] Error al actualizar conversaciones:", error);
    }
  }, [fetchConversations, fetchPipeline, pipeline]);

  // Función para cargar mensajes con paginación
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
          // Cargar detalles de la conversación solo en la primera carga
          if (pageToLoad === 1) {
            setConversationDetail(response.data);
          }

          // Verificar si hay mensajes en la respuesta
          const messagesArray = response.data.messages || [];

          // Formatear mensajes para MessageList
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
            })
          );

          // Verificar si hay más mensajes
          const pagination = response.data.pagination;
          const hasMoreMessages = pagination
            ? pagination.page < pagination.pages
            : false;
          setHasMore(hasMoreMessages);

          if (pageToLoad === 1) {
            // Primera carga: establecer mensajes y marcar como carga inicial
            setMessages(formattedMessages);
            setIsInitialLoad(true);
          } else {
            // Cargas posteriores: anteponer mensajes más antiguos
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

  // Función para cargar más mensajes
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage);
    }
  }, [isLoading, hasMore, page, loadMessages]);

  // Función para enviar mensaje
  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isSubmitting || !currentChatId) return;

    setIsSubmitting(true);

    // Añadir mensaje a la UI temporal (optimistic update)
    const newMessage: Message = {
      _id: Date.now().toString(),
      message: message,
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
      conversation: "",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      // Obtener el número de teléfono del destinatario si está disponible
      const destinationPhone =
        conversationDetail?.conversation?.participants?.contact?.reference ||
        "";

      if (!destinationPhone) {
        console.error("No se pudo determinar el número de destino");
        return;
      }

      // Preparar la data según la estructura esperada por el controlador
      const messageData = {
        to: destinationPhone,
        message: message,
        messageType: "text",
        type: "text", // Tipo de mensaje para el backend
        mediaUrl: "",
        caption: "",
        conversation: currentChatId, // Agregar el ID de la conversación
      };

      // Enviar el mensaje a través del servicio de chat
      await chatService.sendMessage(messageData);

      // Si es necesario, recargar los mensajes para ver la confirmación del servidor
      if (conversationDetail) {
        await loadMessages(1, true);
      }

      // Refrescar la lista de conversaciones para mostrar el nuevo mensaje
      refreshConversations();
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    } finally {
      setIsSubmitting(false);
      setMessage("");
    }
  }, [
    message,
    isSubmitting,
    currentChatId,
    conversationDetail,
    loadMessages,
    refreshConversations,
  ]);

  // Función para cambiar prioridad
  const handlePriorityChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newPriority = e.target.value;

      try {
        if (!conversationDetail) return;

        // Actualiza la UI inmediatamente
        setConversationDetail({
          ...conversationDetail,
          conversation: {
            ...conversationDetail.conversation,
            priority: newPriority,
          },
        });

        // Envía la actualización al backend
        await conversationService.editConversation(
          conversationDetail.conversation._id,
          {
            priority: newPriority,
          }
        );

        // Refrescar conversaciones para mostrar el cambio
        refreshConversations();
      } catch (error) {
        console.error("Error al actualizar la prioridad:", error);
        // Si hay error, revierte el cambio en la UI
        if (conversationDetail) {
          setConversationDetail({
            ...conversationDetail,
            conversation: {
              ...conversationDetail.conversation,
              priority: conversationDetail.conversation.priority,
            },
          });
        }
      }
    },
    [conversationDetail, refreshConversations]
  );

  // Función para enviar archivos
  const sendFile = useCallback(
    async (formData: FormData) => {
      try {
        // Enviar el archivo a través del servicio
        await chatService.sendMessage(formData);

        // Recargar los mensajes para ver el archivo confirmado
        if (conversationDetail) {
          await loadMessages(1, true);
        }

        // Refrescar conversaciones
        refreshConversations();
      } catch (err) {
        console.error("Error al enviar archivo:", err);
        throw err; // Re-lanzar el error para que sea manejado por el llamador
      }
    },
    [conversationDetail, loadMessages, refreshConversations]
  );

  // Función para manejar archivos adjuntos
  const handleAttachmentClick = useCallback(
    async (file: File) => {
      if (!conversationDetail) return;

      const destinationPhone =
        conversationDetail?.conversation?.participants?.contact?.reference ||
        "";

      if (!destinationPhone) {
        console.error("No se pudo determinar el número de destino");
        setUploadError("No se pudo determinar el número de destino");
        return;
      }

      setIsUploadingFile(true);
      setUploadError(null);

      try {
        // Usar el servicio de chat para subir el archivo
        const fileResponse = await chatService.uploadFile(file, true);

        if (!fileResponse.success) {
          throw new Error("Error al subir el archivo");
        }

        // Luego enviar el mensaje con la URL del archivo
        const messageData = new FormData();
        messageData.append("to", destinationPhone);
        const messageType = file.type.startsWith("image/")
          ? "image"
          : "document";
        messageData.append("messageType", messageType);
        messageData.append("type", messageType);
        messageData.append("mediaUrl", fileResponse.mediaURL);
        messageData.append("conversation", currentChatId || "");
        messageData.append("caption", file.name);

        // Enviar el archivo
        await sendFile(messageData);
      } catch (error) {
        console.error("Error al enviar archivo:", error);
        setUploadError("Error al enviar el archivo. Inténtalo de nuevo.");
      } finally {
        setIsUploadingFile(false);
      }
    },
    [conversationDetail, sendFile]
  );

  // Función para manejar subida desde biblioteca
  const handleLibraryUpload = useCallback(
    async (document: FileDocument) => {
      if (!conversationDetail) return;

      const destinationPhone =
        conversationDetail?.conversation?.participants?.contact?.reference ||
        "";

      if (!destinationPhone) {
        console.error("No se pudo determinar el número de destino");
        setUploadError("No se pudo determinar el número de destino");
        return;
      }

      setIsUploadingFile(true);
      setUploadError(null);

      try {
        // Obtener el archivo desde la URL
        const response = await fetch(document.mediaURL);
        if (!response.ok) {
          throw new Error("No se pudo descargar el archivo de la biblioteca");
        }

        const blob = await response.blob();
        const file = new File([blob], document.name, { type: blob.type });

        // Crear FormData para enviar el archivo
        const formData = new FormData();
        formData.append("file", file);
        formData.append("to", destinationPhone);
        formData.append("messageType", document.fileType);
        formData.append("type", document.fileType);
        formData.append("mediaUrl", document.mediaURL);
        formData.append("conversation", currentChatId || "");
        formData.append("caption", document.name);

        // Enviar el archivo
        await sendFile(formData);
      } catch (err) {
        console.error("Error al enviar archivo desde la biblioteca:", err);
        setUploadError(
          "Error al enviar el archivo desde la biblioteca. Inténtalo de nuevo."
        );
      } finally {
        setIsUploadingFile(false);
      }
    },
    [conversationDetail, sendFile]
  );

  // Función para inicializar el chat
  const initializeChat = useCallback(
    (chatId: string, isOpen: boolean) => {
      if (isOpen && chatId) {
        // Restaurar el título cuando el usuario abre una conversación
        restoreTitle();

        setCurrentChatId(chatId);
        setPage(1);
        setHasMore(true);
        setIsInitialLoad(true);
        setError(null);
        setIsLoading(true); // Establecer loading antes de cargar mensajes
        loadMessages(1, true, chatId);
      }
    },
    [loadMessages, restoreTitle]
  );

  // Función para limpiar el chat
  const cleanupChat = useCallback(() => {
    if (currentChatId) {
      unsubscribeFromConversation(currentChatId);
    }
    setCurrentChatId(null);
    setMessages([]);
    setConversationDetail(null);
    setMessage("");
    setError(null);
    setIsLoading(false);
    setIsInitialLoad(true);
    setPage(1);
    setHasMore(true);
  }, [currentChatId]);

  // Función auxiliar para actualizar sólo la conversación afectada en el estado
  const updateConversationPreview = useCallback(
    (chatId: string, data: Partial<Conversation>) => {
      setConversations((prev) =>
        prev.map((conv) => (conv.id === chatId ? { ...conv, ...data } : conv))
      );
    },
    []
  );

  // Función para manejar nuevos mensajes
  const handleNewMessage = useCallback(
    (newMessage: any) => {
      // Manejar diferentes formatos de eventos del backend
      let messageData;
      let chatId;

      if (newMessage.message && newMessage.conversationId) {
        // Formato de whatsapp_message
        messageData = newMessage.message;
        chatId = newMessage.conversationId.toString();
      } else if (newMessage.conversation) {
        // Formato directo de newMessage
        messageData = newMessage;
        chatId = newMessage.conversation;
      } else if (newMessage.type && newMessage.contact) {
        // Formato de newNotification
        showNewMessageNotification(newMessage.contact);
        return; // Solo mostrar notificación, no actualizar mensajes
      } else {
        console.warn("[CHAT] Formato de mensaje desconocido:", newMessage);
        return;
      }

      // Si el mensaje es entrante y no pertenece a la conversación actual, mostrar notificación en el título
      if (messageData.direction === "incoming" && chatId !== currentChatId) {
        const senderName =
          messageData.possibleName ||
          conversations.find((conv) => conv.id === chatId)?.title ||
          messageData.from ||
          "Contacto";

        showNewMessageNotification(senderName);
      }

      // 1. Actualizar mensajes si el chat está abierto
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
          isRead: messageData.isRead || false,
          possibleName: messageData.possibleName || "",
          replyToMessage: messageData.replyToMessage || null,
          messageId: messageData.messageId || "",
          reactions: messageData.reactions || [],
          conversation: chatId,
        };

        setMessages((prev) => [...prev, formattedMessage]);

        // Si es entrante, marcar como leído en backend y estado
        if (messageData.direction === "incoming") {
          chatService.markAsRead(messageData.from);
          updateConversationPreview(chatId, { isRead: true });
        }
      }

      // 2. Actualizar la vista previa de la conversación en el Kanban
      const exists = conversations.some((conv) => conv.id === chatId);

      if (exists) {
        // Actualizar solo la conversación afectada
        updateConversationPreview(chatId, {
          lastMessage: messageData.message,
          createdAt: messageData.timestamp || new Date().toISOString(),
          isRead: chatId === currentChatId || false,
        });
      } else {
        // Es una conversación nueva, obtener solo esta conversación
        (async () => {
          try {
            const response = await conversationService.getConversationById(
              chatId,
              { page: 1, limit: 1 }
            );
            if (response && response.conversation) {
              const apiConv: ApiConversation = response.conversation;
              if (pipeline) {
                const formatted = transformApiConversations(
                  [apiConv],
                  pipeline
                );
                setConversations((prev) => [...formatted, ...prev]);
              }
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
      updateConversationPreview,
      showNewMessageNotification,
      pipeline,
      transformApiConversations,
    ]
  );

  // Efecto para manejar la suscripción a la sala global de la organización
  useEffect(() => {
    if (!user?.organizationId) {
      return;
    }

    const organizationId = user.organizationId;
    const orgRoom = `organization_${organizationId}`;

    // Suscribirse a la sala de la organización
    socket.emit("joinRoom", orgRoom);

    // Limpiar al desmontar
    return () => {
      socket.emit("leaveRoom", orgRoom);
    };
  }, [user?.organizationId]);

  // Efecto para manejar eventos globales de socket (notificaciones y actualizaciones de conversaciones)
  useEffect(() => {
    if (!user?.organizationId) {
      return;
    }

    // Suscribirse a eventos globales de socket
    socket.on("newMessage", handleNewMessage);
    socket.on("whatsapp_message", handleNewMessage);
    socket.on("newNotification", handleNewMessage);

    // Limpiar suscripciones globales
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("whatsapp_message", handleNewMessage);
      socket.off("newNotification", handleNewMessage);
    };
  }, [user?.organizationId, handleNewMessage]);

  // Efecto separado para manejar la suscripción a eventos de socket específicos de conversación
  useEffect(() => {
    if (!currentChatId) {
      return;
    }

    // Suscribirse a la conversación específica
    subscribeToConversation(currentChatId);

    // Limpiar suscripciones
    return () => {
      unsubscribeFromConversation(currentChatId);
    };
  }, [currentChatId]);

  // Nueva función para cargar más conversaciones para una columna
  const loadMoreConversationsForColumn = useCallback(
    async (columnId: string) => {
      if (!pipeline) return;

      const column = columns.find((col) => col.id === columnId);

      if (!column || !column.pagination?.hasMore) return;

      setColumnLoadingStates((prev) => ({ ...prev, [columnId]: true }));

      try {
        const nextPage = (column.pagination?.page || 1) + 1;

        const response = (await conversationService.getConversationsByStage(
          pipeline.pipeline.id,
          columnId,
          nextPage,
          column.pagination?.limit || 50
        )) as {
          success: boolean;
          data: {
            stageId: string;
            conversations: ApiConversation[];
            pagination: {
              page: number;
              limit: number;
              total: number;
              pages: number;
              hasMore: boolean;
            };
          };
        };

        if (response.success && response.data) {
          const formattedConversations = transformApiConversations(
            response.data.conversations,
            pipeline
          );

          // Agregar las nuevas conversaciones al estado existente
          setConversations((prevConversations) => [
            ...prevConversations,
            ...formattedConversations,
          ]);

          // Actualizar la información de paginación de la columna
          setColumns((prevColumns) =>
            prevColumns.map((col) =>
              col.id === columnId
                ? {
                    ...col,
                    pagination: response.data.pagination,
                  }
                : col
            )
          );

          setConversationsError(null);
        } else {
          setConversationsError("Error al cargar más conversaciones");
        }
      } catch (err) {
        console.error("[CHAT] Error cargando más conversaciones:", err);
        setConversationsError("Error al cargar más conversaciones");
      } finally {
        setColumnLoadingStates((prev) => ({ ...prev, [columnId]: false }));
      }
    },
    [pipeline, columns, transformApiConversations]
  );

  // Inicializar pipeline cuando el usuario esté disponible
  useEffect(() => {
    if (
      user?.organizationId &&
      !hasAttemptedPipelineLoad &&
      !isLoadingConversations
    ) {
      fetchPipeline();
    }
  }, [
    user?.organizationId,
    hasAttemptedPipelineLoad,
    isLoadingConversations,
    fetchPipeline,
  ]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Función para verificar el estado del socket
  const checkSocketStatus = useCallback(() => {
    const status = {
      connected: socket.connected,
      id: socket.id,
      url: import.meta.env.VITE_SOCKET_URL || "http://localhost:3001",
      organizationId: user?.organizationId,
      currentChatId,
      conversationsCount: conversations.length,
    };
    console.log("[SOCKET] Estado actual:", status);
    return status;
  }, [user?.organizationId, currentChatId, conversations.length]);

  // Función para forzar reconexión del socket
  const forceSocketReconnect = useCallback(() => {
    console.log("[SOCKET] Forzando reconexión");
    socket.disconnect();
    setTimeout(() => {
      socket.connect();
    }, 1000);
  }, []);

  // Función para probar el socket manualmente
  const testSocket = useCallback(() => {
    console.log("[SOCKET] Probando conexión");
    if (user?.organizationId) {
      const orgRoom = `organization_${user.organizationId}`;
      socket.emit("joinRoom", orgRoom);

      // Emitir un evento de prueba
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
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
