import { useEffect, useState, useRef } from "react";
import {
  Image,
  FileText,
  Camera,
  MapPin,
  Contact2,
  Trash2,
  UserPlus,
  X,
  ChevronRight,
  Plus,
  Building2,
  DollarSign,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { ChatList } from "../components/chat/list/ChatList";
import { ChatHeader } from "../components/chat/list/ChatHeader";
import { MessageList } from "../components/chat/messages/MessageList";
import { MessageInput } from "../components/chat/input/MessageInput";
import { Modal } from "../components/ui/modal";
import { QuickResponses } from "../components/chat/templates/QuickResponses";
import type { Chat, Message, Deal } from "../types/chat";
import chatService from "../services/chatService";
import { useNavigate, useParams } from "react-router-dom";
import { useChatContext } from "../contexts/ChatContext";

const dummyDeals: Deal[] = [
  {
    id: "1",
    name: "Software License 2024",
    value: 5000,
    stage: "Negotiation",
    createdAt: "2024-03-15",
  },
  {
    id: "2",
    name: "Consulting Services",
    value: 12000,
    stage: "Proposal",
    createdAt: "2024-03-10",
  },
];

export function WhatsApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showQuickResponsesModal, setShowQuickResponsesModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDealsModal, setShowDealsModal] = useState(false);
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    name: "",
    value: "",
    stage: "Lead",
    description: "",
  });
  const [chatLists, setChatLists] = useState<Chat[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [chatPage, setChatPage] = useState<number>(1);
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState<boolean>(false);
  const [hasMoreChats, setHasMoreChats] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isContact, setIsContact] = useState<string | boolean>(false);

  const { contactId } = useParams();
  const navigate = useNavigate();

  // Obtener isUploadingFile del contexto de chat
  const { isUploadingFile } = useChatContext();

  const handleSelectChat = (contactId: string) => {
    // Buscamos el chat en la lista actual
    const chat = findChatById(contactId);
    if (chat) {
      setSelectedChat(chat);
      // Actualizar isContact cuando seleccionamos un chat de la lista
      setIsContact(chat.contactId || false); // Asumiendo que contactId en el chat indica que es un contacto
      // Actualizamos la URL sin recargar la página
      window.history.pushState(null, "", `/whatsapp/${contactId}`);
    } else {
      // Si no está en la lista, lo cargamos específicamente
      loadChatById(contactId);
      // Actualizamos la URL sin recargar la página
      window.history.pushState(null, "", `/whatsapp/${contactId}`);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      to: selectedChat.contact,
      message: newMessage,
      messageType: "text",
      mediaUrl: "",
      caption: "",
    };

    try {
      const response = await chatService.sendMessage(messageData);
      if (response) {
        const newMsg: any = {
          _id: response._id,
          user: response.user,
          organization: response.organization,
          from: response.from,
          to: response.to,
          message: response.message,
          mediaUrl: response.mediaUrl,
          mediaId: response.mediaId,
          timestamp: response.timestamp,
          type: response.type,
          direction: "outgoing",
          isRead: true,
          possibleName: selectedChat.possibleName,
          messageId: response.messageId,
          reactions: [],
          replyToMessage: "",
        };
        setMessages([...messages, newMsg]);
        console.log(newMsg, 1);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleQuickResponseSelect = (content: string) => {
    setNewMessage(content);
    setShowQuickResponsesModal(false);
  };

  const handleDeleteChat = () => {
    setSelectedChat(null);
    setShowChatMenu(false);
  };

  const handleCreateDeal = () => {
    // Add deal creation logic here
    setShowCreateDealModal(false);
    // Show success message or handle errors
  };

  const loadChatLists = async (pageNumber: number = 1) => {
    if (isLoadingMoreChats) return;

    try {
      setIsLoadingMoreChats(true);
      const newChats: any = await chatService.getChatLists(
        40,
        pageNumber,
        searchTerm
      );

      if (newChats.length < 10) {
        setHasMoreChats(false);
      }

      if (pageNumber === 1) {
        setChatLists(newChats);
      } else {
        setChatLists((prevChats) => [...prevChats, ...newChats]);
      }

      setChatPage(pageNumber);
    } catch (error) {
      console.error("Error cargando chats:", error);
    } finally {
      setIsLoadingMoreChats(false);
    }
  };

  const loadMoreChats = () => {
    if (hasMoreChats && !isLoadingMoreChats) {
      loadChatLists(chatPage + 1);
    }
  };

  const loadMessages = async (pageNumber: number = 1) => {
    if (!selectedChat || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const newMessages: any = await chatService.getMessages(
        selectedChat?.contact,
        100, // mensajes por página
        pageNumber
      );

      if (newMessages.length < 100) {
        setHasMore(false);
      }
      console.log(newMessages, 1);
      if (pageNumber === 1) {
        setMessages(newMessages);
      } else {
        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      }

      setPage(pageNumber);
    } catch (error) {
      console.error("Error cargando mensajes:", error);
    } finally {
      setIsLoadingMore(false);
      setIsInitialLoad(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !isLoadingMore) {
      loadMessages(page + 1);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChat) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("to", selectedChat.contact);
      formData.append("messageType", "file");
      formData.append("caption", "");

      const response = await chatService.sendMessage(formData);
      if (response) {
        const newMsg: any = {
          _id: response._id,
          user: response.user,
          organization: response.organization,
          from: response.from,
          to: response.to,
          message: response.message,
          mediaUrl: response.mediaUrl,
          mediaId: response.mediaId,
          timestamp: response.timestamp,
          type: response.type,
          direction: "outgoing",
          isRead: true,
          possibleName: selectedChat.possibleName,
          messageId: response.messageId,
          reactions: [],
          replyToMessage: "",
        };
        setMessages([...messages, newMsg]);
      }
    } catch (error) {
      console.error("Error sending file:", error);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  // Esta función busca un chat por ID en la lista de chats
  const findChatById = (contactId: string): Chat | undefined => {
    return chatLists.find((chat) => chat.contact === contactId);
  };

  // Función para cargar un chat específico por ID desde la API
  const loadChatById = async (contactId: string) => {
    try {
      const chat: any = await chatService.getChatById(contactId, 100, 1);

      if (
        chat.messages &&
        Array.isArray(chat.messages) &&
        chat.messages.length > 0
      ) {
        // Encontrar la información del contacto basándonos en el primer mensaje
        const firstMessage = chat.messages[0];
        const contactInfo: Chat = {
          _id: contactId,
          name: firstMessage.possibleName || `+${firstMessage.from}`,
          contact:
            firstMessage.from === "573143007263"
              ? firstMessage.to
              : firstMessage.from,
          lastMessage: firstMessage.message,
          lastMessageTime: firstMessage.timestamp,
          unreadCount: 0,
          possibleName: firstMessage.possibleName || "",
        };

        setIsContact(chat.isContact);

        setSelectedChat(contactInfo);
        setIsInitialLoad(true);
        setMessages(chat.messages);
        setHasMore(chat.messages.length === 100); // Si devuelve 100 mensajes, posiblemente hay más
      }
    } catch (error) {
      console.error("Error al cargar el chat específico:", error);
    }
  };

  useEffect(() => {
    const initialLoad = async () => {
      await loadChatLists();

      // Si hay un chatId en la URL, intentar seleccionar ese chat
      if (contactId) {
        const chat = findChatById(contactId);
        if (chat) {
          setSelectedChat(chat);
        } else {
          // Si no está en la lista cargada, cargarlo específicamente
          loadChatById(contactId);
        }
      }
    };

    initialLoad();
  }, []); // Este efecto solo se ejecuta una vez al montar el componente

  // Este efecto maneja los cambios en el chatId después de la carga inicial
  useEffect(() => {
    if (!contactId) {
      setSelectedChat(null);
      return;
    }

    // Si el ID cambió y no coincide con el chat seleccionado actualmente
    if (selectedChat?._id !== contactId) {
      const chat = findChatById(contactId);
      if (chat) {
        setSelectedChat(chat);
      } else if (chatLists.length > 0) {
        // Si no está en la lista actual pero ya tenemos chats cargados,
        // cargamos específicamente ese chat desde la API
        loadChatById(contactId);
      }
    }
  }, [contactId]); // Solo dependemos del contactId para evitar recargas innecesarias

  useEffect(() => {
    if (selectedChat) {
      // Limpiar y cargar mensajes solo cuando cambie el ID del chat
      setPage(1);
      setHasMore(true);
      setIsInitialLoad(true);
      setMessages([]); // Limpiar mensajes anteriores
      loadMessages(1);
    }
  }, [selectedChat?._id]); // Dependencia solo en el ID del chat, no en todo el objeto

  useEffect(() => {
    setChatPage(1);
    setHasMoreChats(true);
    loadChatLists(1);
  }, [searchTerm]);

  return (
    <div className="h-[calc(100vh-100px)] flex overflow-hidden bg-gray-100">
      <ChatList
        chats={chatLists}
        selectedChat={selectedChat}
        onSelectChat={() => {}} // Esta función ya no se usa
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLoadMore={loadMoreChats}
        isLoading={isLoadingMoreChats}
        hasMore={hasMoreChats}
        handleSelectChat={handleSelectChat}
      />

      <div
        className={`flex-1 flex overflow-hidden flex-col bg-gray-50 ${
          selectedChat ? "block" : "hidden md:block"
        }`}
      >
        {selectedChat ? (
          <>
            <ChatHeader
              chat={selectedChat}
              onBack={() => {
                setSelectedChat(null);
                navigate("/whatsapp", { replace: true });
              }}
              onShowMenu={() => setShowChatMenu(!showChatMenu)}
              isContact={isContact}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
              <MessageList
                messages={messages}
                onLoadMore={loadMoreMessages}
                isLoading={isLoadingMore}
                hasMore={hasMore}
                isInitialLoad={isInitialLoad}
              />

              <MessageInput
                message={newMessage}
                onMessageChange={setNewMessage}
                onSend={handleSendMessage}
                onAttachment={handleAttachmentClick}
                onQuickResponse={() => setShowQuickResponsesModal(true)}
                onMessageTemplates={() => {
                  // TODO: Implementar modal de plantillas
                  console.log("Plantillas de mensaje");
                }}
                onLibraryUpload={(document) => {
                  // Manejar subida desde biblioteca
                  console.log(
                    "Archivo seleccionado desde biblioteca:",
                    document
                  );
                }}
                isUploadingFile={isUploadingFile}
              />
            </div>

            {showChatMenu && (
              <div className="absolute right-0 mt-12 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      if (isContact) {
                        navigate(`/contacts/${isContact}`);
                      }
                    }}
                  >
                    <Contact2 className="w-4 h-4 mr-3" />
                    Ver contacto
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowDealsModal(true);
                      setShowChatMenu(false);
                    }}
                  >
                    <Building2 className="w-4 h-4 mr-3" />
                    Ver negocios
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowCreateDealModal(true);
                      setShowChatMenu(false);
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-3" />
                    Crear negocio
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      // Add create contact logic
                      setShowChatMenu(false);
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-3" />
                    Crear contacto
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={handleDeleteChat}
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Eliminar chat
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                Selecciona un chat para comenzar
              </h2>
              <p className="text-gray-500">
                Elige una conversación de la lista para ver los mensajes
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      <QuickResponses
        isOpen={showQuickResponsesModal}
        onClose={() => setShowQuickResponsesModal(false)}
        onSelect={handleQuickResponseSelect}
      />

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Información del contacto"
      >
        {selectedChat && (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <img
                src={selectedChat.contact}
                alt={selectedChat.name}
                className="w-24 h-24 rounded-full"
              />
              <h3 className="mt-4 text-xl font-semibold">
                {selectedChat.name}
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Teléfono
                </label>
                <p className="mt-1">+1 234 567 890</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="mt-1">contact@example.com</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Notas
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  Cliente VIP - Requiere atención prioritaria
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowContactModal(false)}
              >
                Cerrar
              </Button>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Editar contacto
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Deals Modal */}
      <Modal
        isOpen={showDealsModal}
        onClose={() => setShowDealsModal(false)}
        title="Negocios"
      >
        <div className="space-y-4">
          {dummyDeals.map((deal) => (
            <div
              key={deal.id}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{deal.name}</h4>
                  <p className="text-sm text-gray-500">Etapa: {deal.stage}</p>
                </div>
                <span className="text-lg font-semibold text-action">
                  ${deal.value.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Creado el {new Date(deal.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setShowDealsModal(false);
                setShowCreateDealModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo negocio
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Deal Modal */}
      <Modal
        isOpen={showCreateDealModal}
        onClose={() => setShowCreateDealModal(false)}
        title="Crear nuevo negocio"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del negocio
            </label>
            <input
              type="text"
              value={newDeal.name}
              onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              placeholder="Ej: Proyecto de consultoría"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Valor
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={newDeal.value}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, value: e.target.value })
                }
                className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Etapa
            </label>
            <select
              value={newDeal.stage}
              onChange={(e) =>
                setNewDeal({ ...newDeal, stage: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            >
              <option value="Lead">Lead</option>
              <option value="Qualification">Calificación</option>
              <option value="Proposal">Propuesta</option>
              <option value="Negotiation">Negociación</option>
              <option value="Closed Won">Cerrado Ganado</option>
              <option value="Closed Lost">Cerrado Perdido</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              value={newDeal.description}
              onChange={(e) =>
                setNewDeal({ ...newDeal, description: e.target.value })
              }
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              placeholder="Describe los detalles del negocio..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDealModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateDeal}
              disabled={!newDeal.name || !newDeal.value}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear negocio
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
