import { apiService } from "../config/apiConfig";

export interface ConversationMessage {
  _id: string;
  from: string;
  to: string;
  message: string;
  possibleName?: string;
  timestamp: Date;
  direction: "incoming" | "outgoing";
  type: string;
}

const searchConversations = async (
  query: string
): Promise<ConversationMessage[]> => {
  try {
    const response = await apiService.get(
      `/conversation/search?query=${encodeURIComponent(query)}`
    );
    return (response.data as any).mensajes || [];
  } catch (error) {
    console.error("Error searching conversations:", error);
    throw new Error("Failed to search conversations");
  }
};

const conversationSearchService = {
  searchConversations,
};

export default conversationSearchService;
