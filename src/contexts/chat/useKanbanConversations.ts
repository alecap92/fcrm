import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { conversationService } from "../../services/conversationService";
import chatService from "../../services/chatService";
import {
  ApiConversation,
  Column,
  Conversation,
  Pipeline,
  PipelineStage,
} from "./types";

interface UseKanbanConversationsOptions {
  onShowLoading?: (message: string) => void;
  onHideLoading?: () => void;
}

export function useKanbanConversations(
  options?: UseKanbanConversationsOptions
) {
  const { onShowLoading, onHideLoading } = options || {};

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

  const [isInitialPipelineLoad, setIsInitialPipelineLoad] = useState(true);
  const [hasAttemptedPipelineLoad, setHasAttemptedPipelineLoad] =
    useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const transformApiConversations = useCallback(
    (apiConversations: ApiConversation[], currentPipeline: Pipeline) => {
      return apiConversations.map((conv: ApiConversation) => {
        const stageId =
          currentPipeline.stages[conv.currentStage]?.stageId || "";

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
          lastMessageTimestamp: conv.lastMessage?.timestamp || "",
          lastMessageDirection: conv.lastMessage?.direction || "",
          priority: conv.priority,
          status: stageId,
          currentStage: conv.currentStage,
          assignedTo:
            conv.assignedTo?.firstName + " " + conv.assignedTo?.lastName ||
            "Sin asignar",
          tags: conv.tags,
          createdAt: conv.createdAt,
          isRead: conv.lastMessage?.isRead || false,
          mobile: conv.mobile || conv.participants?.contact?.reference,
        } as Conversation;
      });
    },
    []
  );

  const fetchConversations = useCallback(
    async (currentPipeline: Pipeline | null = null) => {
      try {
        if (!currentPipeline) return;
        setIsLoadingConversations(true);

        const requests = currentPipeline.stages.map((stage) =>
          conversationService.getConversationsByStage(
            currentPipeline.pipeline.id,
            stage.stageId,
            1,
            50
          )
        );

        const results = await Promise.all(requests);

        const nextConversations: Conversation[] = [];
        const nextColumnsPagination: Record<string, any> = {};

        results.forEach((res, idx) => {
          if (res?.success && res.data) {
            const formatted = transformApiConversations(
              res.data.conversations,
              currentPipeline
            );
            nextConversations.push(...formatted);
            nextColumnsPagination[currentPipeline.stages[idx].stageId] =
              res.data.pagination;
          }
        });

        setConversations(nextConversations);
        setColumns((prev) =>
          prev.map((col) =>
            nextColumnsPagination[col.id]
              ? { ...col, pagination: nextColumnsPagination[col.id] }
              : col
          )
        );

        setConversationsError(null);
      } catch (error) {
        setConversationsError("Error al cargar las conversaciones");
      } finally {
        setIsLoadingConversations(false);
      }
    },
    [transformApiConversations]
  );

  const fetchPipeline = useCallback(async () => {
    if (isInitialPipelineLoad) {
      setIsLoadingConversations(true);
      onShowLoading?.("Cargando pipeline...");
    }

    setConversationsError(null);
    setHasAttemptedPipelineLoad(true);

    try {
      const defaultPipelineResponse =
        await conversationService.getDefaultPipeline();
      if (!defaultPipelineResponse?.success || !defaultPipelineResponse.data) {
        throw new Error("No se pudo obtener el pipeline predeterminado");
      }

      const defaultPipelineId = defaultPipelineResponse.data._id;

      const pipelineResponse = await conversationService.getPipelineById(
        defaultPipelineId,
        { page: 1, limit: 10 }
      );

      if (pipelineResponse?.success && pipelineResponse.data) {
        const data = pipelineResponse.data;
        const newPipeline: Pipeline = {
          pipeline: {
            id: data.pipeline.id,
            name: data.pipeline.name,
            isDefault: data.pipeline.isDefault,
          },
          stages: data.stages.map((s: any) => ({
            stageId: s.stageId,
            stageName: s.stageName,
            stageOrder: s.stageOrder,
            stageColor: s.stageColor,
            conversations: [],
            pagination: s.pagination,
          })),
        };

        setPipeline(newPipeline);

        const pipelineColumns: Column[] = data.stages.map(
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

        // Usar conversaciones iniciales ya incluidas en la respuesta
        const allConversations: Conversation[] = transformApiConversations(
          data.stages.flatMap((s: any) => s.conversations || []),
          newPipeline
        );
        setConversations(allConversations);

        setConversationsError(null);
        setRetryCount(0);
      } else {
        if (
          retryCount < 3 &&
          (!pipelineResponse ||
            pipelineResponse.error === "Error de conexión al servidor")
        ) {
          setRetryCount((prev) => prev + 1);
          retryTimeoutRef.current = setTimeout(() => {
            fetchPipeline();
          }, 2000 * (retryCount + 1));
          return;
        }
        setConversationsError(
          "No se pudo cargar el pipeline - respuesta inválida del servidor"
        );
      }
    } catch (err) {
      if (retryCount < 3) {
        setRetryCount((prev) => prev + 1);
        retryTimeoutRef.current = setTimeout(() => {
          fetchPipeline();
        }, 2000 * (retryCount + 1));
        return;
      }
      setConversationsError(
        "Error de conexión - no se pudo cargar el pipeline"
      );
    } finally {
      onHideLoading?.();
      setIsLoadingConversations(false);
      setIsInitialPipelineLoad(false);
    }
  }, [
    onShowLoading,
    onHideLoading,
    isInitialPipelineLoad,
    retryCount,
    transformApiConversations,
  ]);

  const updateConversationStage = useCallback(
    async (chatId: string, newStage: number) => {
      try {
        await conversationService.editConversation(chatId, {
          currentStage: newStage,
        });
        setConversations((prev) => {
          const current = prev.find((c) => c.id === chatId);
          const oldStatus = current?.status;
          const newStatus = pipeline?.stages[newStage]?.stageId || "";
          const updated = prev.map((chat) =>
            chat.id === chatId
              ? { ...chat, status: newStatus, currentStage: newStage }
              : chat
          );

          if (oldStatus && newStatus && oldStatus !== newStatus) {
            setColumns((cols) =>
              cols.map((col) => {
                if (col.id === oldStatus && col.pagination) {
                  return {
                    ...col,
                    pagination: {
                      ...col.pagination,
                      total: Math.max(0, (col.pagination.total || 0) - 1),
                    },
                  };
                }
                if (col.id === newStatus && col.pagination) {
                  return {
                    ...col,
                    pagination: {
                      ...col.pagination,
                      total: (col.pagination.total || 0) + 1,
                    },
                  };
                }
                return col;
              })
            );
          }

          return updated;
        });
      } catch (error) {
        console.error(
          "Error al actualizar la etapa de la conversación:",
          error
        );
        throw error;
      }
    },
    [pipeline]
  );

  const markConversationAsRead = useCallback(
    async (chatId: string, mobile?: string) => {
      if (mobile) {
        await chatService.markAsRead(mobile);
      }
      setConversations((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, isRead: true } : c))
      );
    },
    []
  );

  const deleteConversation = useCallback(async (chatId: string) => {
    await conversationService.deleteConversation(chatId);
    setConversations((prev) => {
      const removed = prev.find((c) => c.id === chatId);
      const next = prev.filter((c) => c.id !== chatId);
      if (removed?.status) {
        setColumns((cols) =>
          cols.map((col) =>
            col.id === removed.status && col.pagination
              ? {
                  ...col,
                  pagination: {
                    ...col.pagination,
                    total: Math.max(0, (col.pagination.total || 0) - 1),
                  },
                }
              : col
          )
        );
      }
      return next;
    });
  }, []);

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
    return (tailwindClass: string): string =>
      colorMap[tailwindClass] || "#4287f5";
  }, []);

  const editColumn = useCallback(
    async (columnId: string, title: string, color: string) => {
      if (!pipeline) return;

      const stageIndex = pipeline.stages.findIndex(
        (stage) => stage.stageId === columnId
      );
      if (stageIndex === -1) return;

      const hexColor = convertTailwindBgClassToHex(color);

      try {
        const updatedStages = pipeline.stages.map((stage) =>
          stage.stageId === columnId
            ? { ...stage, stageName: title, stageColor: hexColor }
            : stage
        );

        const pipelineUpdateData = {
          name: pipeline.pipeline.name,
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
        throw error;
      }
    },
    [pipeline, convertTailwindBgClassToHex]
  );

  const removeColumn = useCallback((columnId: string) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
  }, []);

  const addColumn = useCallback((title: string, color: string) => {
    const newColumn: Column = {
      id: title.toLowerCase().replace(/\s+/g, "_"),
      title,
      color,
    };
    setColumns((prev) => [...prev, newColumn]);
  }, []);

  const conversationsByColumn = useMemo(() => {
    const grouped: Record<string, Conversation[]> = {};
    columns.forEach((column) => {
      const chatsForColumn = conversations.filter(
        (chat) => chat.status === column.id
      );
      // Ordenar por la fecha del último mensaje (fallback a createdAt)
      chatsForColumn.sort((a, b) => {
        const aTime = new Date(
          a.lastMessageTimestamp || a.createdAt || 0
        ).getTime();
        const bTime = new Date(
          b.lastMessageTimestamp || b.createdAt || 0
        ).getTime();
        return bTime - aTime;
      });
      grouped[column.id] = chatsForColumn;
    });
    return grouped;
  }, [conversations, columns]);

  const truncateMessage = useCallback(
    (message: string, maxLength: number = 50) => {
      return message.length > maxLength
        ? `${message.substring(0, maxLength)}...`
        : message;
    },
    []
  );

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
        )) as any;

        if (response?.success && response.data) {
          const formattedConversations = transformApiConversations(
            response.data.conversations,
            pipeline
          );
          setConversations((prevConversations) => [
            ...prevConversations,
            ...formattedConversations,
          ]);
          setColumns((prevColumns) =>
            prevColumns.map((col) =>
              col.id === columnId
                ? { ...col, pagination: response.data.pagination }
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

  const refreshConversations = useCallback(async () => {
    try {
      if (pipeline) {
        await fetchConversations(pipeline);
      } else {
        await fetchPipeline();
      }
    } catch (error) {
      console.error("[CHAT] Error al actualizar conversaciones:", error);
    }
  }, [fetchConversations, fetchPipeline, pipeline]);

  const updateConversationPreview = useCallback(
    (chatId: string, data: Partial<Conversation>) => {
      setConversations((prev) =>
        prev.map((conv) => (conv.id === chatId ? { ...conv, ...data } : conv))
      );
    },
    []
  );

  return {
    // state
    conversations,
    columns,
    pipeline,
    conversationsError,
    searchResults,
    isLoadingConversations,
    columnLoadingStates,

    // actions
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

    // utils
    transformApiConversations,
    conversationsByColumn,
    truncateMessage,

    // setters
    setColumns,
    updateConversationPreview,

    // init flags
    isInitialPipelineLoad,
    hasAttemptedPipelineLoad,
    setHasAttemptedPipelineLoad,
  } as const;
}
