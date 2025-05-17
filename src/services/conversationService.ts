import { apiService } from "../config/apiConfig";

/**
 * Get all conversations
 * @returns {Promise<any>}
 */
const getConversations = async () => {
  try {
    const response = await apiService.get("/conversation");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get a conversation by id
 * @param {string} id
 * @returns {Promise<any>}
 */
const getConversationById = async (id: string) => {
  try {
    const response: any = await apiService.get(`/conversation/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(error);
  }
};

const getPipelineById = async (id: string) => {
  try {
    const response: any = await apiService.get(
      `/conversation/kanban?pipelineId=${id}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const sendMessage = async (message: any) => {
  try {
    const response: any = await apiService.post("/chat/send", message);
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

export const conversationService = {
  getConversations,
  getConversationById,
  getPipelineById,
  sendMessage,
};
