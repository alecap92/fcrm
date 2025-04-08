import { useState } from 'react';
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
  DollarSign
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ChatList } from '../components/chat/ChatList';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { Modal } from '../components/ui/modal';
import type { Chat, Message, QuickResponse, Deal } from '../types/chat';

const dummyDeals: Deal[] = [
  {
    id: '1',
    name: 'Software License 2024',
    value: 5000,
    stage: 'Negotiation',
    createdAt: '2024-03-15',
  },
  {
    id: '2',
    name: 'Consulting Services',
    value: 12000,
    stage: 'Proposal',
    createdAt: '2024-03-10',
  }
];

const quickResponses: QuickResponse[] = [
  {
    id: '1',
    title: 'Saludo',
    content: '¡Hola! ¿Cómo estás?'
  },
  {
    id: '2',
    title: 'Reunión',
    content: '¿Podemos agendar una reunión para discutir los detalles?'
  },
  {
    id: '3',
    title: 'Gracias',
    content: 'Muchas gracias por tu tiempo y atención.'
  },
  {
    id: '4',
    title: 'Confirmación',
    content: 'Confirmo recepción de la información. Me pondré en contacto pronto.'
  }
];

const dummyChats: Chat[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    lastMessage: 'Hey, how are you?',
    timestamp: '10:30 AM',
    unread: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    lastMessage: 'The meeting is scheduled for tomorrow',
    timestamp: 'Yesterday',
    unread: 0,
    isOnline: false,
  },
];

const dummyMessages: Message[] = [
  {
    id: '1',
    content: 'Hey, how are you?',
    timestamp: '10:30 AM',
    sender: 'them',
    status: 'read',
  },
  {
    id: '2',
    content: 'I\'m good, thanks! How about you?',
    timestamp: '10:31 AM',
    sender: 'me',
    status: 'read',
  },
  {
    id: '3',
    content: 'Great! Just working on some new projects.',
    timestamp: '10:32 AM',
    sender: 'them',
    status: 'read',
  },
  {
    id: '4',
    content: 'That sounds interesting! What kind of projects?',
    timestamp: '10:33 AM',
    sender: 'me',
    status: 'delivered',
  },
];

export function WhatsApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(dummyMessages);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showQuickResponsesModal, setShowQuickResponsesModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDealsModal, setShowDealsModal] = useState(false);
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    name: '',
    value: '',
    stage: 'Lead',
    description: ''
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      status: 'sent',
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
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

  return (
    <div className="h-screen flex bg-gray-100">
      <ChatList
        chats={dummyChats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className={`flex-1 flex flex-col bg-gray-50 ${selectedChat ? 'block' : 'hidden md:block'}`}>
        {selectedChat ? (
          <>
            <ChatHeader
              chat={selectedChat}
              onBack={() => setSelectedChat(null)}
              onShowMenu={() => setShowChatMenu(!showChatMenu)}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
              <MessageList messages={messages} />
              
              <MessageInput
                message={newMessage}
                onMessageChange={setNewMessage}
                onSend={handleSendMessage}
                onAttachment={() => setShowAttachmentModal(true)}
                onQuickResponse={() => setShowQuickResponsesModal(true)}
              />
            </div>

            {showChatMenu && (
              <div className="absolute right-0 mt-12 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowContactModal(true);
                      setShowChatMenu(false);
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

      {/* Attachment Modal */}
      <Modal
        isOpen={showAttachmentModal}
        onClose={() => setShowAttachmentModal(false)}
        title="Adjuntar archivo"
      >
        <div className="grid grid-cols-2 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Image className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Imagen</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium">Documento</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Camera className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium">Cámara</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium">Ubicación</span>
          </button>
        </div>
      </Modal>

      {/* Quick Responses Modal */}
      <Modal
        isOpen={showQuickResponsesModal}
        onClose={() => setShowQuickResponsesModal(false)}
        title="Respuestas rápidas"
      >
        <div className="space-y-2">
          {quickResponses.map((response) => (
            <button
              key={response.id}
              className="w-full p-3 text-left rounded-lg hover:bg-gray-50 flex items-center justify-between"
              onClick={() => handleQuickResponseSelect(response.content)}
            >
              <div>
                <h4 className="font-medium text-gray-900">{response.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-1">{response.content}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </Modal>

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
                src={selectedChat.avatar}
                alt={selectedChat.name}
                className="w-24 h-24 rounded-full"
              />
              <h3 className="mt-4 text-xl font-semibold">{selectedChat.name}</h3>
              {selectedChat.isOnline && (
                <span className="text-sm text-green-500">En línea</span>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                <p className="mt-1">+1 234 567 890</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1">contact@example.com</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Notas</label>
                <p className="mt-1 text-sm text-gray-600">Cliente VIP - Requiere atención prioritaria</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowContactModal(false)}>
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
            <div key={deal.id} className="p-4 border rounded-lg hover:bg-gray-50">
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
            <Button onClick={() => {
              setShowDealsModal(false);
              setShowCreateDealModal(true);
            }}>
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
                onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
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
              onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
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
              onChange={(e) => setNewDeal({ ...newDeal, description: e.target.value })}
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