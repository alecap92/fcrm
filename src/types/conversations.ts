export interface ApiConversationResponse {
  conversation: {
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
        contactId: string;
      };
    };
    unreadCount: number;
    pipeline: {
      _id: string;
      name: string;
      organization: string;
      stages: Array<{
        name: string;
        order: number;
        color: string;
        autoAssign: boolean;
        assignToTeam: string | null;
        _id: string;
      }>;
      isDefault: boolean;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
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
    metadata: MetadataItem[];
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  messages: ApiMessage[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Interfaz para el mensaje adaptado para nuestro componente
export interface Message {
  _id: string;
  user: string;
  organization: string;
  from: string;
  to: string;
  message: string;
  mediaUrl: string;
  timestamp: string;
  type: string;
  direction: string;
  isRead: boolean;
}

// Interfaz para el mensaje de la API
export interface ApiMessage {
  _id: string;
  user: string;
  organization: string;
  from: string;
  to: string;
  message: string;
  mediaUrl: string;
  timestamp: string;
  type: string;
  direction: string;
  isRead: boolean;
  possibleName?: string;
  conversation: string;
  reactions: any[];
  replyToMessage: string | null;
}

// Interfaz para los metadatos
export interface MetadataItem {
  key: string;
  value: string;
  _id: string;
}

// Interfaz para la conversación detallada de la API
