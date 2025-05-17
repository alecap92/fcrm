import React, { useState, useEffect } from "react";
import { X, Send, Paperclip, Smile } from "lucide-react";
import ChatMessages from "./ChatMessages";
import ChatSidebar from "./ChatSidebar";
import { conversationService } from "../../services/conversationService";
import {
  ApiConversationResponse,
  ApiMessage,
  MetadataItem,
} from "../../types/conversations";
import { Message } from "../../types/chat";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: {
    id: string;
    title: string;
  };
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, chat }) => {
  const [message, setMessage] = useState("");
  const [conversationDetail, setConversationDetail] =
    useState<ApiConversationResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar la conversación detallada cuando se abre el modal
  useEffect(() => {
    console.log(isOpen, chat.id);
    if (isOpen && chat.id) {
      loadConversationDetail(chat.id);
    }
  }, [isOpen, chat.id]);

  // Función para cargar el detalle de la conversación
  const loadConversationDetail = async (conversationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await conversationService.getConversationById(
        conversationId
      );
      console.log(response, 2);

      if (response) {
        // La respuesta ya tiene el formato esperado
        setConversationDetail(response);

        // Adaptar mensajes al formato requerido por ChatMessages
        const formattedMessages: Message[] = response.messages.map(
          (apiMsg: ApiMessage) => ({
            _id: apiMsg._id,
            message: apiMsg.message,
            user: apiMsg.user,
            organization: apiMsg.organization,
            from: apiMsg.from,
            to: apiMsg.to,
            mediaUrl: apiMsg.mediaUrl || undefined,
            timestamp: new Date(apiMsg.timestamp),
            type: apiMsg.type,
            direction: apiMsg.direction,
            isRead: apiMsg.isRead,
          })
        );

        setMessages(formattedMessages);
      } else {
        setError("No se pudo cargar la conversación");
      }
    } catch (err) {
      console.error("Error al cargar detalles de la conversación:", err);
      setError("Error al cargar la conversación");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!message.trim()) return;

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
        // Campos opcionales para otros tipos de mensajes
        mediaUrl: "",
        caption: "",
      };

      // Enviar el mensaje a través del servicio
      const response = await conversationService.sendMessage(messageData);
      console.log("Mensaje enviado:", response);

      // Si es necesario, recargar los mensajes para ver la confirmación del servidor
      if (conversationDetail) {
        await loadConversationDetail(chat.id);
      }
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      // Mostrar un error al usuario si es necesario
    }

    setMessage("");
  };

  // Determinar si hay metadata para mostrar como subtítulo
  const getSubtitleFromMetadata = (): string => {
    if (!conversationDetail || !conversationDetail.conversation.metadata)
      return "";

    const metadata = conversationDetail.conversation.metadata;
    const origenItem = metadata.find((m: MetadataItem) => m.key === "origen");
    const interesItem = metadata.find((m: MetadataItem) => m.key === "interés");

    if (origenItem && interesItem) {
      return `${origenItem.value} - ${interesItem.value}`;
    } else if (origenItem) {
      return origenItem.value;
    } else if (interesItem) {
      return interesItem.value;
    }

    return "";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-[90vw] h-[90vh] rounded-lg flex overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900">
                {conversationDetail?.conversation.title || chat.title}
              </h3>
              {conversationDetail && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">
                    {getSubtitleFromMetadata()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      conversationDetail.conversation.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : conversationDetail.conversation.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {conversationDetail.conversation.priority === "high"
                      ? "Alta"
                      : conversationDetail.conversation.priority === "medium"
                      ? "Media"
                      : "Baja"}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Messages */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-red-500">
              {error}
            </div>
          ) : (
            <ChatMessages chatId={chat.id} messages={messages} />
          )}

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-end space-x-2">
              <div className="flex-1 bg-gray-100 rounded-lg">
                <div className="flex items-end p-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe un mensaje...2"
                    className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 min-h-[2.5rem]"
                    style={{ height: "2.5rem" }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "2.5rem";
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                  />
                  <div className="flex items-center space-x-2 pl-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Paperclip size={20} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Smile size={20} />
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {conversationDetail && (
          <ChatSidebar
            chatId={chat.id}
            conversation={conversationDetail.conversation}
          />
        )}
      </div>
    </div>
  );
};

export default ChatModal;
