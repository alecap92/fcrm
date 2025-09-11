import { apiService } from "../config/apiConfig";
import { authService } from "../config/authConfig";

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
 * @param {object} params - Optional pagination parameters
 * @returns {Promise<any>}
 */
const getConversationById = async (
  id: string,
  params?: { page?: number; limit?: number }
) => {
  try {
    let url = `/conversation/${id}`;
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }
    const response: any = await apiService.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const getPipelineById = async (
  id: string,
  params?: { page?: number; limit?: number }
) => {
  try {
    let url = `/conversation/kanban?pipelineId=${id}`;
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (queryParams.toString()) {
        url += `&${queryParams.toString()}`;
      }
    }
    const response: any = await apiService.get(url);
    return response.data;
  } catch (error) {
    console.error("Error en getPipelineById:", error);
    return {
      success: false,
      error: "Error de conexión al servidor",
      data: null,
    };
  }
};

const getConversationsByStage = async (
  pipelineId: string,
  stageId: string,
  page: number = 1,
  limit: number = 50
) => {
  try {
    // Asegurarse de que los parámetros sean números
    const validPage = Math.max(1, page);
    const validLimit = Math.max(50, limit);

    const response: any = await apiService.get(
      `/conversation/kanban?pipelineId=${pipelineId}&stageId=${stageId}&page=${validPage}&limit=${validLimit}`
    );

    return response.data;
  } catch (error) {
    console.error("DEBUG Service - Error loading stage:", { stageId, error });
    return {
      success: false,
      error: "Error de conexión al servidor",
      data: null,
    };
  }
};

const sendMessage = async (payload: any) => {
  try {
    // Soportar payload como objeto o FormData, normalizando para el endpoint de conversaciones
    let conversationId: string | null = null;
    let to = "";
    let type = "text";
    let messageText = "";
    let mediaUrl: string | undefined;
    let replyToMessage: string | undefined;

    if (payload instanceof FormData) {
      conversationId = (payload.get("conversation") as string) || null;
      to = ((payload.get("to") as string) || "").trim();
      type = (
        (payload.get("type") as string) ||
        (payload.get("messageType") as string) ||
        "text"
      ).trim();
      mediaUrl = (payload.get("mediaUrl") as string) || undefined;
      messageText = (
        (payload.get("message") as string) ||
        (payload.get("caption") as string) ||
        ""
      ).toString();
      replyToMessage = (payload.get("replyToMessage") as string) || undefined;
    } else {
      conversationId = payload.conversation || null;
      to = (payload.to || "").trim();
      type = (payload.type || payload.messageType || "text").trim();
      mediaUrl = payload.mediaUrl || undefined;
      messageText = (payload.message || payload.caption || "").toString();
      replyToMessage = payload.replyToMessage || undefined;
    }

    if (!conversationId) throw new Error("conversationId requerido");
    if (!to) throw new Error("destinatario (to) requerido");

    const currentUser = authService.getUser();
    const userId = currentUser?.id || currentUser?._id;

    const body = {
      // Fallback explícito a "system" si no se encuentra un identificador de usuario
      from: userId ?? "system",
      to,
      message: messageText,
      mediaUrl,
      type,
      direction: "outgoing",
      replyToMessage,
    } as any;

    const response: any = await apiService.post(
      `/conversation/${conversationId}/messages`,
      body
    );

    if (conversationId) {
      try {
        await markConversationAsRead(conversationId);
      } catch (markError) {
        console.warn("Error al marcar conversación como leída:", markError);
      }
    }

    return response?.data ?? response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

const editConversation = async (id: string, conversation: any) => {
  try {
    const response: any = await apiService.put(
      `/conversation/${id}`,
      conversation
    );
    return response.data;
  } catch (error) {
    console.error("Error editing conversation:", error);
  }
};

const updateConversationPipeline = async (id: string, pipeline: any) => {
  try {
    const response: any = await apiService.put(
      `/conversation/pipelines/${id}`,
      pipeline
    );
    return response.data;
  } catch (error) {
    console.error("Error updating columns:", error);
  }
};

const createConversation = async (conversationData: any) => {
  try {
    const response: any = await apiService.post(
      "/conversation",
      conversationData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

const deleteConversation = async (id: string) => {
  try {
    const response: any = await apiService.delete(`/conversation/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting conversation:", error);
  }
};

const searchConversations = async (searchTerm: string) => {
  try {
    const response: any = await apiService.get(
      `/conversation/search?query=${searchTerm}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching conversations:", error);
  }
};

const findConversationByPhone = async (phoneNumber: string) => {
  try {
    const response: any = await apiService.get(
      `/conversation/find-by-phone?mobile=${phoneNumber}`
    );
    return response.data;
  } catch (error) {
    console.error("Error finding conversation by phone:", error);
    return null;
  }
};

const markConversationAsRead = async (conversationId: string) => {
  try {
    const response: any = await apiService.put(
      `/conversation/${conversationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
};

const getDefaultPipeline = async () => {
  try {
    const response: any = await apiService.get(
      "/conversation/pipelines/default"
    );
    return response.data;
  } catch (error) {
    console.error("Error en getDefaultPipeline:", error);
    return {
      success: false,
      error: "Error de conexión al servidor",
      data: null,
    };
  }
};

export const conversationService = {
  getConversations,
  getConversationById,
  getPipelineById,
  getDefaultPipeline,
  getConversationsByStage,
  sendMessage,
  editConversation,
  updateConversationPipeline,
  createConversation,
  deleteConversation,
  searchConversations,
  findConversationByPhone,
  markConversationAsRead,
};
