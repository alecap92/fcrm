import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Plus,
  X,
  GripVertical,
  Settings,
  Instagram,
  UserPlus,
  AlertCircle,
  User,
} from "lucide-react";
import ChatModal from "../components/chat/ChatModal";
import { Button } from "../components/ui/button";
import { conversationService } from "../services/conversationService";

// Interfaz para las conversaciones de la API
interface ApiConversation {
  _id: string;
  title: string;
  organization: string;
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
  };
  isResolved: boolean;
  priority: string;
  tags: string[];
  leadScore: number;
  firstContactTimestamp: string;
  metadata: Array<{
    key: string;
    value: string;
    _id: string;
  }>;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interfaz para nuestra conversación adaptada
interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  priority: string;
  status: string;
  assignedTo: string;
  tags: string[];
  leadScore: number;
  createdAt: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
}

interface PipelineStage {
  stageId: string;
  stageName: string;
  stageOrder: number;
  stageColor: string;
  conversations: any[];
}

interface Pipeline {
  pipeline: {
    id: string;
    name: string;
    isDefault: boolean;
  };
  stages: PipelineStage[];
}

const colorOptions = [
  { id: "bg-gray-100", label: "Gris" },
  { id: "bg-blue-50", label: "Azul" },
  { id: "bg-red-50", label: "Rojo" },
  { id: "bg-green-50", label: "Verde" },
  { id: "bg-yellow-50", label: "Amarillo" },
  { id: "bg-purple-50", label: "Morado" },
  { id: "bg-pink-50", label: "Rosa" },
  { id: "bg-indigo-50", label: "Índigo" },
];

const Conversations: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("bg-gray-100");
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(
    null
  );
  const [newChatPlatform, setNewChatPlatform] = useState<
    "whatsapp" | "instagram"
  >("whatsapp");
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);

  const fetchConversations = async (currentPipeline = pipeline) => {
    if (!currentPipeline) return;

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
        // Transformar las conversaciones de la API a nuestro formato
        const formattedConversations: Conversation[] = response.data.map(
          (conv: ApiConversation) => {
            // Obtener el stageId basado en currentStage y las etapas del pipeline
            const stageId =
              currentPipeline.stages[conv.currentStage]?.stageId || "";

            return {
              id: conv._id,
              title: conv.title,
              lastMessage:
                getMetadataValue(conv.metadata, "interés") || "Sin mensaje",
              priority: conv.priority,
              status: stageId,
              assignedTo: conv.assignedTo?.email || "Sin asignar",
              tags: conv.tags,
              leadScore: conv.leadScore,
              createdAt: conv.createdAt,
            };
          }
        );

        setConversations(formattedConversations);
      }
    } catch (err) {
      console.error("Error al cargar conversaciones:", err);
    }
  };

  // Función auxiliar para obtener el valor de un campo de metadata
  const getMetadataValue = (
    metadata: Array<{ key: string; value: string; _id: string }>,
    key: string
  ): string => {
    const item = metadata.find((m) => m.key === key);
    return item ? item.value : "";
  };

  const fetchPipeline = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pipelineResponse = await conversationService.getPipelineById(
        "6814ef02e3de1af46109d105"
      );

      if (pipelineResponse.success && pipelineResponse.data) {
        setPipeline(pipelineResponse.data);

        // Convertir las etapas del pipeline a columnas
        const pipelineColumns = pipelineResponse.data.stages.map(
          (stage: PipelineStage) => ({
            id: stage.stageId,
            title: stage.stageName,
            color: convertHexToTailwindBgClass(stage.stageColor),
          })
        );

        setColumns(pipelineColumns);

        // Pasar directamente los datos del pipeline recién obtenidos
        await fetchConversations(pipelineResponse.data);
      } else {
        setError("No se pudo cargar el pipeline");
      }
    } catch (err) {
      console.error("Error al cargar el pipeline:", err);
      setError("Error al cargar el pipeline");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para convertir colores HEX a clases de Tailwind (aproximadas)
  const convertHexToTailwindBgClass = (hexColor: string): string => {
    // Mapeo básico de colores HEX a clases de Tailwind
    const colorMap: Record<string, string> = {
      "#4287f5": "bg-blue-500", // Azul
      "#42c5f5": "bg-blue-300", // Azul claro
      "#f5a442": "bg-orange-400", // Naranja
      "#42f584": "bg-green-400", // Verde
      "#f54242": "bg-red-500", // Rojo
      "#f542f5": "bg-purple-500", // Púrpura
      "#f5f542": "bg-yellow-400", // Amarillo
    };

    return colorMap[hexColor] || "bg-gray-200"; // Color por defecto si no hay coincidencia
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const handleDragStart = (e: React.DragEvent, chatId: string) => {
    e.dataTransfer.setData("chatId", chatId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const chatId = e.dataTransfer.getData("chatId");

    // Aquí podría implementarse la llamada a la API para actualizar el estado de la conversación
    setConversations((prevChats) =>
      prevChats.map((chat) => (chat.id === chatId ? { ...chat, status } : chat))
    );
  };

  const handleColumnDragStart = (index: number) => {
    setDraggedColumnIndex(index);
  };

  const handleColumnDragOver = (index: number) => {
    if (draggedColumnIndex === null) return;
    if (draggedColumnIndex === index) return;

    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      const [draggedColumn] = newColumns.splice(draggedColumnIndex, 1);
      newColumns.splice(index, 0, draggedColumn);
      setDraggedColumnIndex(index);
      return newColumns;
    });
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnIndex(null);
  };

  const handleNewChat = () => {
    if (!newChatName.trim()) return;

    const newChat: Conversation = {
      id: Date.now().toString(),
      title: newChatName,
      lastMessage: "Nueva conversación iniciada",
      priority: "medium",
      status: columns.length > 0 ? columns[0].id : "",
      assignedTo: "usuario@ejemplo.com",
      tags: [],
      leadScore: 0,
      createdAt: new Date().toISOString(),
    };

    setConversations((prev) => [...prev, newChat]);
    setNewChatName("");
    setShowNewChatModal(false);
  };

  const addNewColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColumn: Column = {
      id: newColumnTitle.toLowerCase().replace(/\s+/g, "_"),
      title: newColumnTitle,
      color: newColumnColor,
    };

    setColumns((prev) => [...prev, newColumn]);
    setNewColumnTitle("");
    setNewColumnColor("bg-gray-100");
  };

  const removeColumn = (columnId: string) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
    setConversations((prev) =>
      prev.map((chat) =>
        chat.status === columnId ? { ...chat, status: columns[0].id } : chat
      )
    );
  };

  const deleteChat = (chatId: string) => {
    setConversations((prev) => prev.filter((chat) => chat.id !== chatId));
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    return message.length > maxLength
      ? `${message.substring(0, maxLength)}...`
      : message;
  };

  const handleChatClick = (chat: Conversation) => {
    setSelectedChat(chat);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // Renderizar el indicador de prioridad
  const renderPriorityBadge = (priority: string) => {
    const priorityStyles: Record<string, string> = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          priorityStyles[priority] || "bg-gray-100"
        }`}
      >
        {priority === "high"
          ? "Alta"
          : priority === "medium"
          ? "Media"
          : "Baja"}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pipeline...</p>
        </div>
      </div>
    );
  }

  if (error || !pipeline) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error de Pipeline</h2>
          <p className="text-gray-600 mb-6">
            {error || "No se encontró ningún pipeline configurado"}
          </p>
          <Button onClick={fetchPipeline}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col h-screen">
        <div className="bg-white border-b">
          <div className="p-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Conversaciones Sociales
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Pipeline: {pipeline.pipeline.name}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowColumnsModal(true)}
                variant="outline"
                className="flex items-center"
              >
                <Settings size={16} className="mr-2" />
                Administrar Columnas
              </Button>
              <Button
                onClick={() => setShowNewChatModal(true)}
                className="flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Nueva Conversación
              </Button>
              <Button
                onClick={() => setShowNewChatModal(true)}
                variant="default"
                className="flex items-center bg-green-500 hover:bg-green-600"
              >
                <UserPlus size={16} className="mr-2" />
                Nuevo Lead
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-6">
            {columns.map((column, index) => {
              const columnChats = conversations.filter(
                (chat) => chat.status === column.id
              );
              return (
                <div
                  key={column.id}
                  className={`${column.color} rounded-lg flex flex-col h-full min-w-[320px] max-w-[320px]`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                  draggable
                  onDragStart={() => handleColumnDragStart(index)}
                  onDragEnd={handleColumnDragEnd}
                >
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
                        <h3 className="font-medium text-gray-900">
                          {column.title}
                        </h3>
                      </div>
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {columnChats.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {columnChats.map((chat) => (
                      <div
                        key={chat.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, chat.id)}
                        onClick={() => handleChatClick(chat)}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {chat.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {truncateMessage(chat.lastMessage)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {renderPriorityBadge(chat.priority)}
                              <span className="text-xs text-gray-500">
                                {formatDate(chat.createdAt)}
                              </span>
                            </div>
                            {chat.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {chat.tags.slice(0, 2).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {chat.tags.length > 2 && (
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                    +{chat.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChat(chat.id);
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <User size={14} className="mr-1" />
                              {chat.assignedTo.split("@")[0]}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Zona para arrastrar cuando la columna está vacía */}
                    <div
                      className={`
                        h-20 rounded-lg flex items-center justify-center transition-all 
                        ${
                          columnChats.length === 0
                            ? "border-2 border-dashed border-gray-300"
                            : ""
                        }
                      `}
                    >
                      {columnChats.length === 0 && (
                        <p className="text-sm text-gray-500">
                          Arrastra una conversación aquí
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {selectedChat && (
        <ChatModal
          isOpen={true}
          onClose={() => setSelectedChat(null)}
          chat={selectedChat as any}
        />
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Nueva Conversación
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Contacto
                </label>
                <input
                  type="text"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingresa el nombre del contacto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plataforma
                </label>
                <select
                  value={newChatPlatform}
                  onChange={(e) =>
                    setNewChatPlatform(
                      e.target.value as "whatsapp" | "instagram"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setShowNewChatModal(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button onClick={handleNewChat} disabled={!newChatName.trim()}>
                  Crear Conversación
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Columns Modal */}
      {showColumnsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px]">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Administrar Columnas
            </h3>
            <div className="space-y-6">
              {/* Current Columns */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-3">
                  Columnas Actuales
                </h4>
                <div className="space-y-2">
                  {columns.map((column, index) => (
                    <div
                      key={column.id}
                      draggable
                      onDragStart={() => handleColumnDragStart(index)}
                      onDragOver={() => handleColumnDragOver(index)}
                      onDragEnd={handleColumnDragEnd}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center">
                        <GripVertical
                          size={20}
                          className="text-gray-400 mr-2 cursor-move"
                        />
                        <div
                          className={`w-4 h-4 rounded-full ${column.color.replace(
                            "bg-",
                            "bg-opacity-50 bg-"
                          )} mr-2`}
                        />
                        <span className="text-gray-900 font-medium">
                          {column.title}
                        </span>
                      </div>
                      <button
                        onClick={() => removeColumn(column.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        disabled={columns.length <= 1}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Column */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-3">
                  Añadir Nueva Columna
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre de la columna"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setNewColumnColor(color.id)}
                        className={`p-2 rounded-lg border-2 ${
                          newColumnColor === color.id
                            ? "border-blue-500"
                            : "border-transparent hover:border-gray-300"
                        } transition-colors`}
                      >
                        <div
                          className={`w-full h-8 rounded ${color.id} flex items-center justify-center`}
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {color.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={addNewColumn}
                    className="w-full"
                    disabled={!newColumnTitle.trim()}
                  >
                    Añadir Columna
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setShowColumnsModal(false)}
                  variant="outline"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversations;
