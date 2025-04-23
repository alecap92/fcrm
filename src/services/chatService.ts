import { apiService } from "../config/apiConfig";


const getChatLists = async (limit: number, page: number, searchTerm: string) => {
    try {
        const response = await apiService.get(`/chat/chat-list?limit=${limit}&page=${page}&search=${searchTerm}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching chat lists:', error);
        throw error;
    }
}

const getChatById = async (contactId: string, limit?: number, page?: number) => {
    try {
        const response = await apiService.get(`/chat/byContactId/${contactId}?limit=${limit}&page=${page}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching chat by ID:', error);
        throw error;
    }
}

const getMessages = async (contact: string, limit: number, page: number) => {
    try {
        const response = await apiService.get(`/chat/messages?contact=${contact}&limit=${limit}&page=${page}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
}

const sendMessage = async (message: any) => {
    try {
        const response:any = await apiService.post('/chat/send', message);
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
    }}


const chatService = { getChatLists, getChatById, getMessages, sendMessage }

export default chatService;