import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";

export type ModuleType =
  | "deals"
  | "contacts"
  | "conversations"
  | "quotes"
  | "invoices"
  | "products"
  | "projects"
  | "analytics"
  | "automations"
  | "general";

export interface ChatContextData {
  module: ModuleType;
  data: any;
  metadata?: {
    currentPage?: string;
    filters?: any;
    selectedItems?: any[];
    totalCount?: number;
  };
  // Nueva función para estadísticas (cuando el módulo es deals)
  getDealsStats?: (period?: "current" | "previous") => Promise<any>;
  getTopSellingProducts?: (
    period?: "current" | "previous",
    limit?: number
  ) => Promise<any>;
}

export interface ChatSuggestion {
  id: string;
  text: string;
  action?: () => void;
}

export interface ChatButton {
  id: string;
  text: string;
  type: "action" | "gpt" | "suggestion";
  variant?: "primary" | "secondary" | "outline";
  action?: () => void;
  icon?: string;
}

interface ChatContextType {
  contextData: ChatContextData | null;
  suggestions: ChatSuggestion[];
  setContextData: (data: ChatContextData) => void;
  addSuggestion: (suggestion: ChatSuggestion) => void;
  clearSuggestions: () => void;
  sendContextualMessage: (
    message: string,
    buttons?: ChatButton[],
    options?: { variant?: "default" | "warning" | "info"; icon?: string }
  ) => void;
  registerMessageHandler: (
    handler: (
      message: string,
      sender: "user" | "assistant",
      buttons?: ChatButton[],
      options?: { variant?: "default" | "warning" | "info"; icon?: string }
    ) => void
  ) => void;
  unregisterMessageHandler: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [contextData, setContextDataState] = useState<ChatContextData | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([]);
  const messageHandlerRef = useRef<
    | ((
        message: string,
        sender: "user" | "assistant",
        buttons?: ChatButton[],
        options?: { variant?: "default" | "warning" | "info"; icon?: string }
      ) => void)
    | null
  >(null);
  const pendingMessagesRef = useRef<
    Array<{
      message: string;
      sender: "user" | "assistant";
      buttons?: ChatButton[];
      options?: { variant?: "default" | "warning" | "info"; icon?: string };
    }>
  >([]);

  const setContextData = useCallback((data: ChatContextData) => {
    setContextDataState(data);
    // Generar sugerencias automáticas basadas en el módulo
    generateSuggestions(data);
  }, []);

  const addSuggestion = useCallback((suggestion: ChatSuggestion) => {
    setSuggestions((prev) => [...prev, suggestion]);
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  const registerMessageHandler = useCallback(
    (
      handler: (
        message: string,
        sender: "user" | "assistant",
        buttons?: ChatButton[],
        options?: { variant?: "default" | "warning" | "info"; icon?: string }
      ) => void
    ) => {
      messageHandlerRef.current = handler;
      // Procesar mensajes pendientes
      if (pendingMessagesRef.current.length > 0) {
        pendingMessagesRef.current.forEach(
          ({ message, sender, buttons, options }) => {
            handler(message, sender, buttons, options);
          }
        );
        pendingMessagesRef.current = [];
      }
    },
    []
  );

  const unregisterMessageHandler = useCallback(() => {
    messageHandlerRef.current = null;
  }, []);

  const sendContextualMessage = useCallback(
    (
      message: string,
      buttons?: ChatButton[],
      options?: { variant?: "default" | "warning" | "info"; icon?: string }
    ) => {
      if (messageHandlerRef.current) {
        messageHandlerRef.current(message, "assistant", buttons, options);
      } else {
        pendingMessagesRef.current.push({
          message,
          sender: "assistant",
          buttons,
          options,
        });
        console.log("Mensaje agregado a cola pendiente:", message);
      }
    },
    []
  );

  const generateSuggestions = (data: ChatContextData) => {
    const newSuggestions: ChatSuggestion[] = [];

    switch (data.module) {
      case "deals":
        newSuggestions.push(
          {
            id: "deals-1",
            text: "¿Cómo puedo mejorar mis tasas de conversión?",
          },
          { id: "deals-2", text: "Muéstrame estadísticas de mis deals" },
          { id: "deals-3", text: "¿Qué deals necesitan seguimiento?" }
        );
        break;

      case "contacts":
        newSuggestions.push(
          { id: "contacts-1", text: "¿Cómo segmentar mejor mis contactos?" },
          {
            id: "contacts-2",
            text: "Ayúdame a crear una campaña para estos contactos",
          },
          { id: "contacts-3", text: "¿Qué contactos están más activos?" }
        );
        break;

      case "conversations":
        newSuggestions.push(
          { id: "conv-1", text: "¿Cómo mejorar el tiempo de respuesta?" },
          { id: "conv-2", text: "Muéstrame conversaciones pendientes" },
          { id: "conv-3", text: "Ayúdame con plantillas de respuesta" }
        );
        break;

      case "quotes":
        newSuggestions.push(
          { id: "quotes-1", text: "¿Cómo optimizar mis cotizaciones?" },
          { id: "quotes-2", text: "Muéstrame cotizaciones pendientes" },
          { id: "quotes-3", text: "¿Qué productos se cotizan más?" }
        );
        break;

      case "analytics":
        newSuggestions.push(
          { id: "analytics-1", text: "Explícame estos datos" },
          { id: "analytics-2", text: "¿Qué tendencias veo aquí?" },
          {
            id: "analytics-3",
            text: "Dame recomendaciones basadas en estos números",
          }
        );
        break;

      default:
        newSuggestions.push(
          { id: "general-1", text: "¿Cómo usar esta función?" },
          { id: "general-2", text: "Muéstrame tutoriales" },
          { id: "general-3", text: "¿Qué puedo hacer aquí?" }
        );
    }

    setSuggestions(newSuggestions);
  };

  const value: ChatContextType = {
    contextData,
    suggestions,
    setContextData,
    addSuggestion,
    clearSuggestions,
    sendContextualMessage,
    registerMessageHandler,
    unregisterMessageHandler,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext debe ser usado dentro de un ChatProvider");
  }
  return context;
};
