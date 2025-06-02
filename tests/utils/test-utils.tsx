import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// Wrapper personalizado para las pruebas
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

// Función de render personalizada
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-exportar todo
export * from "@testing-library/react";
export { customRender as render };

// Factory functions para datos de prueba
export const createMockUser = (overrides = {}) => ({
  id: "1",
  name: "Usuario Test",
  email: "test@example.com",
  role: "user",
  ...overrides,
});

export const createMockConversation = (overrides = {}) => ({
  id: "1",
  title: "Conversación Test",
  status: "active",
  messages: [],
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockWorkflow = (overrides = {}) => ({
  id: "1",
  name: "Workflow Test",
  description: "Descripción de prueba",
  nodes: [],
  edges: [],
  isActive: true,
  ...overrides,
});

// Helpers para eventos
export const mockEvent = (overrides = {}) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: { value: "" },
  ...overrides,
});

// Mock para APIs
export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
});
