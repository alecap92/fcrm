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
import {
  socket,
  subscribeToConversation,
  unsubscribeFromConversation,
} from "../services/socketService";
import { Message } from "../types/chat";
import { ApiMessage } from "../types/conversations";
import type { FileDocument } from "../services/filesService";
import { groupMessagesByDate, getHoursDifference } from "../lib";

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

// Constantes
const PIPELINE_ID = "6814ef02e3de1af46109d105";
const ORGANIZATION_ID = "659d89b73c6aa865f1e7d6fb";

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

        return {
          id: conv._id,
          title: conv.title,
          lastMessage: conv.lastMessage?.message || "",
          priority: conv.priority,
          status: stageId,
          assignedTo:
            conv.assignedTo?.firstName + " " + conv.assignedTo?.lastName ||
            "Sin asignar",
          tags: conv.tags,
          createdAt: conv.lastMessage?.timestamp || conv.createdAt,
          isRead: conv.lastMessage?.isRead || false,
          mobile: conv.mobile,
        };
      });
    },
    []
  );

  // Función para obtener conversaciones
  const fetchConversations = useCallback(
    async (currentPipeline?: Pipeline | null) => {
      const targetPipeline = currentPipeline || pipeline;
      if (!targetPipeline) return;

      setIsLoadingConversations(true);
      try {
        const response = (await conversationService.getConversations()) as {
          success: boolean;
          data: ApiConversation[];
          pagination?: {
            total: number;
            page: number;
            limit: number;
            pages: number;
          };
        };

        if (response.success && response.data) {
          const formattedConversations = transformApiConversations(
            response.data,
            targetPipeline
          );
          setConversations(formattedConversations);
          setConversationsError(null);
        }
      } catch (err) {
        console.error("Error al cargar conversaciones:", err);
        setConversationsError("Error al cargar conversaciones");
      } finally {
        setIsLoadingConversations(false);
      }
    },
    [pipeline, transformApiConversations]
  );

  // Función para obtener pipeline
  const fetchPipeline = useCallback(async () => {
    // Solo mostrar loading si no es un retry
    if (isInitialPipelineLoad) {
      setIsLoadingConversations(true);
    }

    setConversationsError(null);
    setHasAttemptedPipelineLoad(true);

    try {
      const pipelineResponse = await conversationService.getPipelineById(
        PIPELINE_ID,
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
      setIsLoadingConversations(false);
      setIsInitialPipelineLoad(false);
    }
  }, [fetchConversations, isInitialPipelineLoad, retryCount]);

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
      if (!pipeline) return;

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
          organization: ORGANIZATION_ID,
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
    [pipeline, convertTailwindBgClassToHex]
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
    return columns.reduce((acc, column) => {
      acc[column.id] = conversations.filter(
        (chat) => chat.status === column.id
      );
      return acc;
    }, {} as Record<string, Conversation[]>);
  }, [columns, conversations]);

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

  // Función para refrescar conversaciones
  const refreshConversations = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Función para cargar mensajes con paginación
  const loadMessages = useCallback(
    async (pageToLoad = 1, initial = false, chatId?: string) => {
      const targetChatId = chatId || currentChatId;
      console.log("loadMessages llamado con:", {
        pageToLoad,
        initial,
        targetChatId,
        currentChatId,
      });

      if (!targetChatId) {
        console.warn("No hay targetChatId, no se pueden cargar mensajes");
        setIsLoading(false);
        return;
      }

      console.log("Estableciendo isLoading = true");
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

        console.log("Response from backend:", response);

        if (response && response.data) {
          console.log("Datos de conversación cargados exitosamente");
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
          console.error("Respuesta inválida del backend:", response);
          setError("No se pudo cargar la conversación");
        }
      } catch (err) {
        console.error("Error al cargar mensajes:", err);
        setError("Error al cargar la conversación");
        setHasMore(false);
      } finally {
        console.log("loadMessages completado, estableciendo isLoading = false");
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
        mediaUrl: "",
        caption: "",
      };

      // Enviar el mensaje a través del servicio
      await conversationService.sendMessage(messageData);

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
        // Crear FormData para enviar el archivo
        const formData = new FormData();
        formData.append("file", file);
        formData.append("to", destinationPhone);
        formData.append(
          "messageType",
          file.type.startsWith("image/") ? "image" : "document"
        );
        formData.append("caption", file.name);

        // Enviar el archivo
        await sendFile(formData);
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
      console.log("initializeChat llamado con:", { chatId, isOpen });
      if (isOpen && chatId) {
        console.log("Inicializando chat:", chatId);
        setCurrentChatId(chatId);
        setPage(1);
        setHasMore(true);
        setIsInitialLoad(true);
        setError(null);
        setIsLoading(true); // Establecer loading antes de cargar mensajes
        console.log("Llamando loadMessages desde initializeChat");
        loadMessages(1, true, chatId);
      } else {
        console.log("No se inicializa chat - condiciones no cumplidas:", {
          isOpen,
          chatId,
        });
      }
    },
    [loadMessages]
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

  // Efecto para manejar la suscripción a eventos de socket
  useEffect(() => {
    if (!currentChatId) return;

    // Suscribirse a la sala de la organización
    const organizationId = ORGANIZATION_ID;
    const orgRoom = `organization_${organizationId}`;

    console.log("[Socket] Suscribiéndose a salas:", {
      conversationId: currentChatId,
      organizationId,
      orgRoom,
      socketId: socket.id,
    });

    // Suscribirse a la conversación
    subscribeToConversation(currentChatId);

    // Suscribirse a la sala de la organización
    socket.emit("joinRoom", orgRoom);

    // Función para manejar nuevos mensajes
    const handleNewMessage = (newMessage: any) => {
      console.log("[Socket] Nuevo mensaje recibido:", {
        messageId: newMessage._id,
        conversationId: newMessage.conversation,
        currentChatId: currentChatId,
        messageType: newMessage.type,
        direction: newMessage.direction,
        rawMessage: newMessage,
      });

      // Verificar si el mensaje pertenece a esta conversación
      if (newMessage.conversation === currentChatId) {
        console.log(
          "[Socket] Mensaje pertenece a esta conversación, actualizando UI"
        );
        setMessages((prevMessages) => {
          // Verificar si el mensaje ya existe para evitar duplicados
          const messageExists = prevMessages.some(
            (msg) => msg._id === newMessage._id
          );
          if (messageExists) {
            return prevMessages;
          }

          // Agregar el nuevo mensaje al final (ya que viene en orden cronológico)
          return [...prevMessages, newMessage];
        });

        // Si el mensaje es entrante, marcar como leído
        if (newMessage.direction === "incoming") {
          console.log("[Socket] Mensaje entrante, marcando como leído");
          chatService.markAsRead(newMessage.from);
        }
      } else {
        console.log(
          "[Socket] Mensaje no pertenece a esta conversación, ignorando"
        );
      }

      // Siempre refrescar la lista de conversaciones para mostrar nuevos mensajes
      refreshConversations();
    };

    // Suscribirse a eventos de socket
    socket.on("new_message", handleNewMessage);
    socket.on("whatsapp_message", handleNewMessage);

    // Limpiar suscripciones
    return () => {
      console.log(`[Socket] Limpiando suscripciones`, {
        conversationId: currentChatId,
        orgRoom,
      });
      socket.off("new_message", handleNewMessage);
      socket.off("whatsapp_message", handleNewMessage);
      socket.emit("leaveRoom", orgRoom);
      unsubscribeFromConversation(currentChatId);
    };
  }, [currentChatId, refreshConversations]);

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
          column.pagination?.limit || 10
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
          console.error("Respuesta inválida del backend:", response);
          setConversationsError("Error al cargar más conversaciones");
        }
      } catch (err) {
        console.error("Error al cargar más conversaciones:", err);
        setConversationsError("Error al cargar más conversaciones");
      } finally {
        setColumnLoadingStates((prev) => ({ ...prev, [columnId]: false }));
      }
    },
    [pipeline, columns, transformApiConversations]
  );

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

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
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
