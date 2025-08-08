import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Plus, Settings, AlertCircle, Search, RefreshCcw } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatModal from "../components/chat/modal/ChatModal";
import { Button } from "../components/ui/button";
import ManageColumnsModal from "../components/chat/modal/ManageColumnsModal";
import NewChatModal from "../components/chat/modal/NewChatModal";
import ConversationCard from "../components/chat/list/ConversationCard";
import {
  VariableSizeList as List,
  ListChildComponentProps,
} from "react-window";
import ConfirmModal from "../components/ui/confirmModal";
import SearchModal from "../components/chat/modal/SearchModal";
import templatesService from "../services/templatesService";
import { ITemplate } from "../types/templates";
import { useToast } from "../components/ui/toast";
import { useLoading } from "../contexts/LoadingContext";
import { useChatContext } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
import integrationService from "../services/integrationService";
import { conversationService } from "../services/conversationService";

// Componente separado para cada columna que maneja su propio scroll infinito
const ConversationColumn: React.FC<{
  column: any;
  index: number;
  columnChats: any[];
  isColumnLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stageIndex: number) => void;
  onDragStart: (e: React.DragEvent, chatId: string) => void;
  onChatClick: (chat: any) => void;
  onDeleteFromCard: (chat: any) => void;
  truncateMessage: (message: string) => string;
}> = ({
  column,
  index,
  columnChats,
  isColumnLoading,
  hasMore,
  onLoadMore,
  onDragOver,
  onDrop,
  onDragStart,
  onChatClick,
  onDeleteFromCard,
  truncateMessage,
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listRef = useRef<any>(null);
  const sizesRef = useRef<number[]>([]);
  const defaultItemSize = 164;

  useEffect(() => {
    if (!isFetching) return;
    fetchMoreData();
  }, [isFetching]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const fetchMoreData = useCallback(async () => {
    if (hasMore && !isColumnLoading) {
      await onLoadMore();
    }
    setIsFetching(false);
  }, [onLoadMore, hasMore, isColumnLoading]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      // Prefetch cuando alcance 70% del scroll
      if (
        scrollPercentage >= 0.7 &&
        hasMore &&
        !isColumnLoading &&
        !isFetching
      ) {
        // Debounce the scroll event
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setIsFetching(true);
        }, 100);
      }
    },
    [hasMore, isColumnLoading, isFetching]
  );

  // item renderer con medición dinámica (VariableSizeList)
  const Row = useCallback(
    ({ index: rowIndex, style }: ListChildComponentProps) => {
      const chat = columnChats[rowIndex];
      if (!chat) return null;

      return (
        <div style={style}>
          <div
            ref={(el) => {
              if (!el) return;
              const height = el.getBoundingClientRect().height;
              if (height && sizesRef.current[rowIndex] !== height) {
                sizesRef.current[rowIndex] = height;
                // Recalcular tamaños desde este índice
                listRef.current?.resetAfterIndex(rowIndex);
              }
            }}
            className="px-2 pt-2 cursor-pointer"
            draggable
            onDragStart={(e) => onDragStart(e, chat.id)}
            onClick={() => onChatClick(chat)}
          >
            <ConversationCard
              title={chat.title}
              lastMessage={truncateMessage(chat.lastMessage)}
              lastMessageDate={chat.lastMessageTimestamp}
              lastMessageDirection={chat.lastMessageDirection}
              priority={chat.priority}
              createdAt={chat.createdAt}
              assignedTo={chat.assignedTo}
              tags={chat.tags}
              isRead={chat.isRead}
              onDelete={() => onDeleteFromCard(chat)}
              status={chat.status}
              currentStage={chat.currentStage}
            />
          </div>
        </div>
      );
    },
    [columnChats, onDragStart, onChatClick, onDeleteFromCard, truncateMessage]
  );

  return (
    <div
      key={column.id}
      style={{ backgroundColor: column.color }}
      className="rounded-lg flex flex-col h-full w-[320px] relative"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
    >
      {/* Column Header */}
      <div className="p-3 bg-white rounded-t-lg border-b">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  column.color === "bg-gray-100" ? "#9CA3AF" : "",
              }}
            />
            <h3 className="font-medium text-gray-900">{column.title}</h3>
          </div>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {column.pagination?.total || columnChats.length}
          </span>
        </div>
      </div>

      {/* Column Content with Infinite Scroll */}
      <div
        className="flex-1 overflow-y-hidden overflow-x-visible"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        <List
          ref={listRef}
          height={Math.max(200, window.innerHeight - 240)}
          itemCount={columnChats.length}
          itemSize={(index) => sizesRef.current[index] || defaultItemSize}
          estimatedItemSize={defaultItemSize}
          width={320}
          onScroll={({ scrollOffset }: any) => {
            const totalHeight =
              (columnChats.length || 0) * (defaultItemSize || 1);
            const visible = Math.max(200, window.innerHeight - 240);
            const percent = totalHeight
              ? (scrollOffset + visible) / totalHeight
              : 0;
            if (percent >= 0.7 && hasMore && !isColumnLoading && !isFetching) {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              timeoutRef.current = setTimeout(() => setIsFetching(true), 100);
            }
          }}
        >
          {Row}
        </List>

        {/* Loading indicator */}
        {isColumnLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-600">Cargando más...</span>
          </div>
        )}

        {/* Empty State */}
        {columnChats.length === 0 && !isColumnLoading && (
          <div className="h-20 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <p className="text-sm text-gray-500">
              Arrastra una conversación aquí
            </p>
          </div>
        )}

        {/* End of list indicator */}
        {!hasMore && columnChats.length > 0 && (
          <div className="text-center py-2">
            <span className="text-xs text-gray-400">
              No hay más conversaciones
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const Conversations: React.FC = () => {
  // Estados para modales
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estado para verificación de WhatsApp
  const [hasWhatsAppConfig, setHasWhatsAppConfig] = useState<boolean | null>(
    null
  );
  const [isCheckingWhatsApp, setIsCheckingWhatsApp] = useState(true);

  // Referencias para evitar dependencias innecesarias
  const toastRef = useRef<any>(null);
  const loadingRef = useRef<any>({ showLoading: null, hideLoading: null });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { organization } = useAuth();

  // Usar el contexto expandido
  const {
    // Estado de conversaciones
    conversations,
    columns,
    pipeline,
    conversationsError,
    searchResults,
    isLoadingConversations,
    columnLoadingStates,

    // Funciones de gestión de conversaciones
    fetchPipeline,
    updateConversationStage,
    markConversationAsRead,
    deleteConversation,
    searchConversations,
    loadMoreConversationsForColumn,

    // Funciones de gestión de columnas
    editColumn,
    removeColumn,
    addColumn,
    setColumns,

    // Funciones de utilidad
    conversationsByColumn,
    truncateMessage,
    refreshConversations,

    // Funciones de limpieza
    cleanupChat,
  } = useChatContext();

  const toast = useToast();
  const { showLoading, hideLoading } = useLoading();

  // Actualizar referencias
  toastRef.current = toast;
  loadingRef.current = { showLoading, hideLoading };

  // Referencia para evitar múltiples llamadas
  const hasInitialized = useRef(false);

  // Verificar configuración de WhatsApp al cargar el componente
  useEffect(() => {
    const checkWhatsAppConfig = async () => {
      try {
        setIsCheckingWhatsApp(true);
        const hasConfig = await integrationService.checkWhatsAppIntegration();
        setHasWhatsAppConfig(hasConfig);
      } catch (error) {
        console.error("Error verificando configuración de WhatsApp:", error);
        setHasWhatsAppConfig(false);
      } finally {
        setIsCheckingWhatsApp(false);
      }
    };

    checkWhatsAppConfig();
  }, []);

  // Efecto para cargar pipeline inicial (solo una vez)
  useEffect(() => {
    if (!hasInitialized.current && hasWhatsAppConfig === true) {
      hasInitialized.current = true;
      fetchPipeline();
    }
  }, [fetchPipeline, hasWhatsAppConfig]);

  // Efecto para abrir conversación desde parámetros URL
  useEffect(() => {
    const openPhone = searchParams.get("openPhone");
    if (openPhone && pipeline && !selectedChat) {
      const openConversationFromPhone = async () => {
        try {
          const conversationResponse =
            await conversationService.findConversationByPhone(openPhone);

          if (
            conversationResponse?.success &&
            conversationResponse?.conversation
          ) {
            const realConversation = {
              id: conversationResponse.conversation._id,
              title: conversationResponse.conversation.title,
              mobile: openPhone,
              ...conversationResponse.conversation,
            };

            setSelectedChat(realConversation);
            await markConversationAsRead(
              realConversation.id,
              realConversation.mobile
            );

            // Limpiar el parámetro de la URL
            setSearchParams({});
          } else {
            toastRef.current?.show({
              title: "Conversación no encontrada",
              description:
                "No se pudo encontrar una conversación activa para este número",
              type: "warning",
            });
            // Limpiar el parámetro de la URL
            setSearchParams({});
          }
        } catch (error) {
          console.error("Error al abrir conversación:", error);
          toastRef.current?.show({
            title: "Error al abrir conversación",
            description: "No se pudo cargar la conversación",
            type: "error",
          });
          // Limpiar el parámetro de la URL
          setSearchParams({});
        }
      };

      openConversationFromPhone();
    }
  }, [
    searchParams,
    pipeline,
    selectedChat,
    markConversationAsRead,
    setSearchParams,
  ]);

  // Handlers para drag and drop (estables)
  const handleDragStart = useCallback((e: React.DragEvent, chatId: string) => {
    e.dataTransfer.setData("chatId", chatId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, stageIndex: number) => {
      e.preventDefault();
      const chatId = e.dataTransfer.getData("chatId");

      try {
        await updateConversationStage(chatId, stageIndex);
        toastRef.current?.show({
          title: "Conversación actualizada",
          description: "La conversación se ha movido correctamente",
          type: "success",
        });
      } catch (error) {
        toastRef.current?.show({
          title: "Error al actualizar conversación",
          description: "No se pudo mover la conversación",
          type: "error",
        });
      }
    },
    [updateConversationStage]
  );

  // Handler para click en conversación (estable)
  const handleChatClick = useCallback(
    async (chat: any) => {
      setSelectedChat(chat);
      await markConversationAsRead(chat.id, chat.mobile);
    },
    [markConversationAsRead]
  );

  // Handler específico para resultados de búsqueda
  const handleSearchResultClick = useCallback(
    async (searchResult: any) => {
      const { showLoading, hideLoading } = loadingRef.current;
      const toast = toastRef.current;

      try {
        showLoading("buscando conversación...");

        // Intentar encontrar la conversación real por número de teléfono
        const conversationResponse =
          await conversationService.findConversationByPhone(searchResult.from);

        if (
          conversationResponse?.success &&
          conversationResponse?.conversation
        ) {
          // Si encontramos la conversación real, usarla
          const realConversation = {
            id: conversationResponse.conversation._id,
            title: conversationResponse.conversation.title,
            mobile: searchResult.from,
            ...conversationResponse.conversation,
          };

          setSelectedChat(realConversation);
          await markConversationAsRead(
            realConversation.id,
            realConversation.mobile
          );
        } else {
          // Si no encontramos conversación, mostrar mensaje informativo
          toast?.show({
            title: "Conversación no encontrada",
            description:
              "No se pudo encontrar una conversación activa para este número",
            type: "warning",
          });
        }
      } catch (error) {
        console.error("Error al buscar conversación:", error);
        toast?.show({
          title: "Error al buscar conversación",
          description: "No se pudo cargar la conversación",
          type: "error",
        });
      } finally {
        hideLoading();
      }
    },
    [markConversationAsRead]
  );

  // Handler para confirmar eliminación (optimizado)
  const handleConfirm = useCallback(async () => {
    if (!selectedChat) return;

    const { showLoading, hideLoading } = loadingRef.current;
    const toast = toastRef.current;

    try {
      showLoading("eliminando conversación...");
      await deleteConversation(selectedChat.id);

      toast?.show({
        title: "Conversación eliminada",
        description: "La conversación se ha eliminado correctamente",
        type: "success",
      });

      setShowConfirmModal(false);
      setSelectedChat(null);
    } catch (error) {
      console.error("Error al eliminar la conversación:", error);
      toast?.show({
        title: "Error al eliminar la conversación",
        description: "La conversación no se ha eliminado correctamente",
        type: "error",
      });
    } finally {
      hideLoading();
    }
  }, [selectedChat, deleteConversation]);

  // Handler para nueva conversación (optimizado)
  const handleNewChatSubmit = useCallback(
    async (chatData: { template: ITemplate; phoneNumber: string }) => {
      const { showLoading, hideLoading } = loadingRef.current;
      const toast = toastRef.current;

      try {
        showLoading("creando conversación...");
        await templatesService.sendTemplate(
          chatData.template,
          chatData.phoneNumber
        );

        toast?.show({
          title: "Conversación creada correctamente",
          description: "La conversación se ha creado correctamente",
          type: "success",
        });

        setShowNewChatModal(false);
        // Refrescar conversaciones después de crear una nueva
        refreshConversations();
      } catch (error) {
        console.error("Error al crear la conversación:", error);
        toast?.show({
          title: "Error al crear la conversación",
          description: "La conversación no se ha creado correctamente",
          type: "error",
        });
      } finally {
        hideLoading();
      }
    },
    [refreshConversations]
  );

  // Handler para cerrar modal de chat (estable)
  const handleCloseChat = useCallback(() => {
    setSelectedChat(null);
    cleanupChat(); // Limpiar el estado del chat context
  }, [cleanupChat]);

  // Handler para editar columna con manejo de errores (optimizado)
  const handleEditColumn = useCallback(
    async (columnId: string, title: string, color: string) => {
      const toast = toastRef.current;

      try {
        await editColumn(columnId, title, color);
        toast?.show({
          title: "Columna actualizada",
          description: "La columna se ha actualizado correctamente",
          type: "success",
        });
      } catch (error) {
        toast?.show({
          title: "Error al actualizar columna",
          description: "No se pudo actualizar la columna",
          type: "error",
        });
      }
    },
    [editColumn]
  );

  const handleRefreshConversations = useCallback(async () => {
    await refreshConversations();
  }, [refreshConversations]);

  // Función para manejar la actualización
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshConversations();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handlers para modales (estables y memoizados)
  const modalHandlers = useMemo(
    () => ({
      showSearch: () => setShowSearchModal(true),
      showColumns: () => setShowColumnsModal(true),
      showNewChat: () => setShowNewChatModal(true),
      closeSearch: () => setShowSearchModal(false),
      closeColumns: () => setShowColumnsModal(false),
      closeNewChat: () => setShowNewChatModal(false),
      closeConfirm: () => setShowConfirmModal(false),
    }),
    []
  );

  // Handler para eliminar conversación desde la tarjeta (estable)
  const handleDeleteFromCard = useCallback((chat: any) => {
    setSelectedChat(chat);
    setShowConfirmModal(true);
  }, []);

  // Lazy render de columnas: sólo renderizar las visibles en el viewport horizontal
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 4 });

  const onHorizontalScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    const columnWidth = 320 + 24; // ancho col + gap aprox
    const start = Math.max(0, Math.floor(scrollLeft / columnWidth) - 1);
    const end = Math.min(
      columns.length,
      Math.ceil((scrollLeft + width) / columnWidth) + 1
    );
    setVisibleRange({ start, end });
  }, [columns.length]);

  useEffect(() => {
    onHorizontalScroll();
  }, [columns.length, onHorizontalScroll]);

  const renderedColumns = useMemo(() => {
    return columns.map((column, index) => {
      if (index < visibleRange.start || index > visibleRange.end) {
        return (
          <div key={column.id} style={{ width: 320 }} className="shrink-0" />
        );
      }
      const columnChats = conversationsByColumn[column.id] || [];
      const isColumnLoading = columnLoadingStates[column.id] || false;
      const hasMore = column.pagination?.hasMore || false;

      return (
        <ConversationColumn
          key={column.id}
          column={column}
          index={index}
          columnChats={columnChats}
          isColumnLoading={isColumnLoading}
          hasMore={hasMore}
          onLoadMore={() => loadMoreConversationsForColumn(column.id)}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onChatClick={handleChatClick}
          onDeleteFromCard={handleDeleteFromCard}
          truncateMessage={truncateMessage}
        />
      );
    });
  }, [
    columns,
    conversationsByColumn,
    columnLoadingStates,
    loadMoreConversationsForColumn,
    handleDragOver,
    handleDrop,
    handleDragStart,
    handleChatClick,
    handleDeleteFromCard,
    truncateMessage,
    visibleRange.start,
    visibleRange.end,
  ]);

  // Memoizar el estado de error para evitar re-renderizados
  const errorState = useMemo(() => {
    // Solo mostrar error si hay un error específico Y no estamos cargando
    if (conversationsError && !isLoadingConversations) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error de Pipeline</h2>
            <p className="text-gray-600 mb-6">{conversationsError}</p>
            <Button onClick={fetchPipeline} disabled={isLoadingConversations}>
              {isLoadingConversations ? "Cargando..." : "Reintentar"}
            </Button>
          </div>
        </div>
      );
    }
    return null;
  }, [conversationsError, isLoadingConversations, fetchPipeline]);

  // Memoizar el estado de carga
  const loadingState = useMemo(() => {
    // Mostrar loading solo si estamos cargando Y no hay pipeline aún
    if (isLoadingConversations && !pipeline) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Cargando pipeline...</span>
        </div>
      );
    }
    return null;
  }, [isLoadingConversations, pipeline]);

  // Determinar si mostrar el contenido principal
  const shouldShowMainContent = useMemo(() => {
    return pipeline && !conversationsError && hasWhatsAppConfig === true;
  }, [pipeline, conversationsError, hasWhatsAppConfig]);

  // Mostrar loading mientras se verifica la configuración
  if (isCheckingWhatsApp) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">
            Verificando configuración
          </h2>
          <p className="text-gray-600">
            Comprobando la integración de WhatsApp...
          </p>
        </div>
      </div>
    );
  }

  // Si no hay configuración de WhatsApp, mostrar mensaje de configuración requerida
  if (hasWhatsAppConfig === false) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full mx-4">
          <div className="text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Configuración de WhatsApp Requerida
            </h2>
            <p className="text-gray-600 mb-6">
              Para gestionar conversaciones necesitas configurar primero la
              integración con WhatsApp Business API. Esto incluye el token de
              acceso y el ID del número de teléfono.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Configura la API de WhatsApp para empezar a recibir y enviar
                mensajes
              </p>
              <Button onClick={() => navigate("/settings")} className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Configurar WhatsApp API
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar estado de error
  if (errorState) {
    return errorState;
  }

  // Si está cargando y no hay pipeline, mostrar loading
  if (loadingState) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        {loadingState}
      </div>
    );
  }

  // Si no hay pipeline y no hay error, mostrar estado vacío
  if (!shouldShowMainContent) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
          <p className="text-gray-600">
            Preparando el pipeline de conversaciones
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="bg-white border-b">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Conversaciones
                  </h1>
                  {hasWhatsAppConfig !== null &&
                    !hasWhatsAppConfig &&
                    !isCheckingWhatsApp && (
                      <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">WhatsApp no configurado</span>
                      </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2"
                  >
                    <RefreshCcw
                      className={`w-4 h-4 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    Actualizar
                  </Button>
                  {/* Debug button removed */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSearchModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Buscar
                  </Button>
                  <Button
                    onClick={() => setShowNewChatModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Chat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowColumnsModal(true)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Debug panel removed */}

          {/* Content */}
          <div
            className="flex-1 overflow-x-auto p-6"
            style={{ height: "calc(100vh - 120px)" }}
          >
            <div
              ref={containerRef}
              onScroll={onHorizontalScroll}
              className="flex gap-6 h-full overflow-x-auto"
            >
              {renderedColumns}
            </div>
          </div>
        </div>

        {/* Modales */}
        {selectedChat && (
          <ChatModal
            isOpen={true}
            onClose={handleCloseChat}
            chat={selectedChat}
          />
        )}

        {showNewChatModal && (
          <NewChatModal
            isOpen={showNewChatModal}
            onClose={modalHandlers.closeNewChat}
            onSubmit={handleNewChatSubmit}
          />
        )}

        {showSearchModal && (
          <SearchModal
            isOpen={showSearchModal}
            onClose={modalHandlers.closeSearch}
            onSubmit={searchConversations}
            searchResults={searchResults}
            handleChatClick={handleSearchResultClick}
          />
        )}

        {showColumnsModal && (
          <ManageColumnsModal
            isOpen={showColumnsModal}
            onClose={modalHandlers.closeColumns}
            columns={columns}
            onColumnRemove={removeColumn}
            onColumnAdd={addColumn}
            onColumnEdit={handleEditColumn}
            onColumnsReorder={setColumns}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={modalHandlers.closeConfirm}
        onConfirm={handleConfirm}
        title="Eliminar Conversación"
        message="¿Estás seguro de querer eliminar esta conversación?"
      />
    </>
  );
};

export default Conversations;
