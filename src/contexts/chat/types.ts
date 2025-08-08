import React from "react";
import { Message } from "../../types/chat";

// Tipos base de API y dominio para conversaciones y pipeline
export interface ApiConversation {
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

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  lastMessageDirection: string;
  priority: string;
  status: string;
  assignedTo: string;
  tags: string[];
  createdAt: string;
  isRead: boolean;
  mobile?: string;
  currentStage: number;
}

export interface Column {
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

export interface PipelineStage {
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

export interface Pipeline {
  pipeline: {
    id: string;
    name: string;
    isDefault: boolean;
  };
  stages: PipelineStage[];
}

export interface ChatContextType {
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
  handleLibraryUpload: (document: any) => Promise<void>;
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
