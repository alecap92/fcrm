import { useCallback } from "react";
import {
  useChatContext,
  ModuleType,
  ChatContextData,
  ChatSuggestion,
} from "../context/ChatContext";

export const useChatModule = (module: ModuleType) => {
  const { setContextData, addSuggestion, clearSuggestions } = useChatContext();

  const updateChatContext = useCallback(
    (data: any, metadata?: ChatContextData["metadata"]) => {
      // Si el data contiene funciones estadísticas, extraerlas al nivel superior
      let contextData: ChatContextData;

      if (
        data &&
        typeof data === "object" &&
        ("getDealsStats" in data || "getTopSellingProducts" in data)
      ) {
        contextData = {
          module,
          data: data.data, // Los datos reales están en data.data
          metadata,
          getDealsStats: data.getDealsStats, // Extraer la función al nivel superior
          getTopSellingProducts: data.getTopSellingProducts, // Extraer la función al nivel superior
        };
      } else {
        contextData = {
          module,
          data,
          metadata,
        };
      }

      setContextData(contextData);
    },
    [module, setContextData]
  );

  const sendSuggestion = useCallback(
    (text: string, action?: () => void) => {
      const suggestion: ChatSuggestion = {
        id: `${module}-${Date.now()}`,
        text,
        action,
      };
      addSuggestion(suggestion);
    },
    [module, addSuggestion]
  );

  const clearModuleSuggestions = useCallback(() => {
    clearSuggestions();
  }, [clearSuggestions]);

  // Funciones específicas por módulo
  const moduleHelpers = {
    deals: {
      updateDeals: (deals: any[], filters?: any) => {
        updateChatContext(deals, {
          currentPage: "deals",
          filters,
          totalCount: deals.length,
        });
      },
      suggestDealAction: (dealId: string, action: string) => {
        sendSuggestion(`${action} para el deal ${dealId}`, () => {
          console.log(`Ejecutando ${action} para deal ${dealId}`);
        });
      },
    },

    contacts: {
      updateContacts: (contacts: any[], filters?: any) => {
        updateChatContext(contacts, {
          currentPage: "contacts",
          filters,
          totalCount: contacts.length,
        });
      },
      suggestContactAction: (contactId: string, action: string) => {
        sendSuggestion(`${action} para el contacto ${contactId}`, () => {
          console.log(`Ejecutando ${action} para contacto ${contactId}`);
        });
      },
    },

    conversations: {
      updateConversations: (conversations: any[], pendingCount?: number) => {
        updateChatContext(conversations, {
          currentPage: "conversations",
          totalCount: conversations.length,
        });
      },
    },

    quotes: {
      updateQuotes: (quotes: any[], filters?: any) => {
        updateChatContext(quotes, {
          currentPage: "quotes",
          filters,
          totalCount: quotes.length,
        });
      },
    },

    analytics: {
      updateAnalytics: (analyticsData: any, chartType?: string) => {
        updateChatContext(analyticsData, {
          currentPage: "analytics",
        });
      },
    },
  };

  return {
    updateChatContext,
    sendSuggestion,
    clearModuleSuggestions,
    ...moduleHelpers[module as keyof typeof moduleHelpers],
  };
};
