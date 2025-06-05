// Configuración de endpoints de API

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-production-api.com"
    : "http://localhost:3001";

export const API_ENDPOINTS = {
  // Chat endpoints
  CHAT_GPT: `${API_BASE_URL}/api/chat/gpt`,

  // Otros endpoints existentes
  CONTACTS: `${API_BASE_URL}/api/contacts`,
  DEALS: `${API_BASE_URL}/api/deals`,
  // ... otros endpoints
};

export default API_ENDPOINTS;
