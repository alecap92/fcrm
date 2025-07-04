import { apiService } from "../config/apiConfig";
import axios, { AxiosResponse } from "axios";
import { authService } from "../config/authConfig";
import { socket } from "./socketService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface UploadFileResponse {
  mediaURL: string;
  success: boolean;
}

const getChatLists = async (
  limit: number,
  page: number,
  searchTerm: string
) => {
  try {
    const response = await apiService.get(
      `/chat/chat-list?limit=${limit}&page=${page}&search=${searchTerm}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching chat lists:", error);
    throw error;
  }
};

const getChatById = async (
  contactId: string,
  limit?: number,
  page?: number
) => {
  try {
    const response = await apiService.get(
      `/chat/byContactId/${contactId}?limit=${limit}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching chat by ID:", error);
    throw error;
  }
};

const getMessages = async (contact: string, limit: number, page: number) => {
  try {
    const response = await apiService.get(
      `/chat/messages?contact=${contact}&limit=${limit}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

const sendMessage = async (message: any) => {
  try {
    console.log("servicio de chat");
    console.log(API_BASE_URL, "API URL");
    const token = authService.getToken();
    let response: AxiosResponse;
    if (message instanceof FormData) {
      // Si es FormData, usar axios directamente
      response = await axios.post(`${API_BASE_URL}/chat/send`, message, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + token,
        },
      });
    } else {
      // Si no es FormData, usar apiService
      response = await apiService.post("/chat/send", message);
    }

    // Emitir evento de socket para notificar el nuevo mensaje
    if (response.data) {
      socket.emit("message_sent", {
        conversationId: message.conversation,
        message: response.data,
      });
    }

    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

const markAsRead = async (contactFrom: any) => {
  try {
    const response: any = await apiService.put(`/chat/mark-as-read`, {
      contact: contactFrom,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating message:", error);
    throw error;
  }
};

const uploadFile = async (
  file: File,
  isVisible: boolean = true
): Promise<UploadFileResponse> => {
  try {
    const token = authService.getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("isVisible", isVisible.toString());

    console.log("Intentando subir archivo:", {
      url: `${API_BASE_URL}/files/upload`,
      fileSize: file.size,
      fileType: file.type,
      isVisible,
    });

    const response = await axios.post(
      `${API_BASE_URL}/files/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + token,
        },
        params: {
          isVisible,
        },
      }
    );

    console.log("Respuesta del servidor:", response.data);

    // Verificar si la respuesta tiene la estructura esperada
    if (!response.data || !response.data.mediaURL) {
      console.error("Respuesta inesperada del servidor:", response.data);
      throw new Error("El servidor no devolvió la URL del archivo");
    }

    return {
      mediaURL: response.data.mediaURL,
      success: true,
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Error detallado al subir archivo:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          "Error al subir el archivo"
      );
    }
    console.error("Error inesperado al subir archivo:", err);
    throw new Error("Error inesperado al subir el archivo");
  }
};

const chatService = {
  getChatLists,
  getChatById,
  getMessages,
  sendMessage,
  markAsRead,
  uploadFile,
};

export default chatService;
