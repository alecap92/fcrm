import { apiService } from "../config/apiConfig";
import axios, { AxiosResponse } from "axios";
import { authService } from "../config/authConfig";
import { socket } from "./socketService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

const chatService = {
  getChatLists,
  getChatById,
  getMessages,
  sendMessage,
  markAsRead,
};

export default chatService;
