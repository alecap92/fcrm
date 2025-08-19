import { vi } from "vitest";

// Mocks para las llamadas a la API

export const mockApiEndpoints = {
  // Auth endpoints
  login: "/api/auth/login",
  register: "/api/auth/register",
  logout: "/api/auth/logout",

  // User endpoints
  getProfile: "/api/users/profile",
  updateProfile: "/api/users/profile",

  // Conversations endpoints
  getConversations: "/api/conversations",
  getConversation: (id: string) => `/api/conversations/${id}`,
  createConversation: "/api/conversations",

  // Workflows endpoints
  getWorkflows: "/api/workflows",
  getWorkflow: (id: string) => `/api/workflows/${id}`,
  createWorkflow: "/api/workflows",
  updateWorkflow: (id: string) => `/api/workflows/${id}`,

  // Contacts endpoints
  getContacts: "/api/contacts",
  createContact: "/api/contacts",
};

// Datos mock para respuestas
export const mockResponses = {
  user: {
    id: "1",
    name: "Usuario Test",
    email: "test@example.com",
    role: "admin",
    createdAt: "2024-01-01T00:00:00.000Z",
  },

  conversation: {
    id: "1",
    title: "Conversación Test",
    status: "active",
    messages: [
      {
        id: "1",
        content: "Hola, ¿cómo estás?",
        sender: "user",
        timestamp: "2024-01-01T10:00:00.000Z",
      },
      {
        id: "2",
        content: "¡Hola! Muy bien, gracias.",
        sender: "bot",
        timestamp: "2024-01-01T10:01:00.000Z",
      },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
  },

  workflow: {
    id: "1",
    name: "Workflow de Bienvenida",
    description: "Automatización para nuevos usuarios",
    nodes: [
      {
        id: "start",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { label: "Inicio" },
      },
      {
        id: "action1",
        type: "action",
        position: { x: 300, y: 100 },
        data: { label: "Enviar Email" },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "start",
        target: "action1",
      },
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
  },

  contact: {
    id: "1",
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "+57 300 123 4567",
    company: "Empresa Test",
    tags: ["cliente", "vip"],
    createdAt: "2024-01-01T00:00:00.000Z",
  },
};

// Función helper para crear respuestas mock
export const createMockResponse = (data: any, status = 200, delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      });
    }, delay);
  });
};

// Mock de fetch personalizado
export const mockFetch = (responses: Record<string, any>) => {
  return vi.fn().mockImplementation((url: string, options?: RequestInit) => {
    const method = options?.method || "GET";
    const key = `${method} ${url}`;

    if (responses[key]) {
      return createMockResponse(responses[key]);
    }

    // Respuesta por defecto para URLs no mockeadas
    return createMockResponse({ error: "Not found" }, 404);
  });
};

// Configuraciones comunes de mock
export const mockAuthenticatedFetch = mockFetch({
  "GET /api/users/profile": mockResponses.user,
  "GET /api/conversations": [mockResponses.conversation],
  "GET /api/workflows": [mockResponses.workflow],
  "GET /api/contacts": [mockResponses.contact],
});

export const mockUnauthenticatedFetch = mockFetch({
  "POST /api/auth/login": { token: "mock-token", user: mockResponses.user },
  "POST /api/auth/register": { token: "mock-token", user: mockResponses.user },
});
