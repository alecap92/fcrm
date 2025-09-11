import { apiService } from "../config/apiConfig";

// Define the N8n Automation interface
interface N8nAutomation {
  _id: string;
  endpoint: string;
  name: string;
  organizationId: string;
  userId: string;
  apiKey?: string;
  createdAt: string;
  updatedAt: string;
  method: string;
  needData?: boolean;
}

// Define response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

// Get all n8n automations for the organization
const getN8nAutomations = async (): Promise<any> => {
  try {
    const response = await apiService.get<ApiResponse<N8nAutomation[]>>("/n8n");
    console.log("N8N API Response:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching n8n automations:", error);
    throw error;
  }
};

// Create a new n8n automation
const createN8nAutomation = async (data: {
  name: string;
  endpoint: string;
  apiKey?: string;
  method?: string;
}): Promise<ApiResponse<N8nAutomation>> => {
  try {
    const response = await apiService.post<ApiResponse<N8nAutomation>>(
      "/n8n/automations",
      data
    );
    return response;
  } catch (error) {
    console.error("Error creating n8n automation:", error);
    throw error;
  }
};

// Update an existing n8n automation
const updateN8nAutomation = async (
  id: string,
  data: Partial<{
    name: string;
    endpoint: string;
    apiKey?: string;
    method?: string;
  }>
): Promise<ApiResponse<N8nAutomation>> => {
  try {
    const response = await apiService.put<ApiResponse<N8nAutomation>>(
      `/n8n/automations/${id}`,
      data
    );
    return response;
  } catch (error) {
    console.error("Error updating n8n automation:", error);
    throw error;
  }
};

// Delete an n8n automation
const deleteN8nAutomation = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response = await apiService.delete<ApiResponse<void>>(
      `/n8n/automations/${id}`
    );
    return response;
  } catch (error) {
    console.error("Error deleting n8n automation:", error);
    throw error;
  }
};

// Test an n8n automation endpoint
const testN8nAutomation = async (
  endpoint: string,
  apiKey?: string
): Promise<boolean> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
        source: "fusioncol-n8n-test",
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error testing n8n automation:", error);
    return false;
  }
};

// Validate n8n automation data
const validateN8nAutomationData = (data: {
  name: string;
  endpoint: string;
  apiKey?: string;
  method?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push("El nombre es requerido");
  }

  if (!data.endpoint || data.endpoint.trim().length === 0) {
    errors.push("El endpoint es requerido");
  } else {
    try {
      new URL(data.endpoint);
    } catch {
      errors.push("El endpoint debe ser una URL válida");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Execute n8n automation with conversation context
const executeN8nAutomation = async (
  automationId: string,
  body: any
): Promise<ApiResponse<any>> => {
  try {
    const response = await apiService.post<ApiResponse<any>>(
      `/n8n/${automationId}/execute`,
      body
    );
    return response;
  } catch (error) {
    console.error("Error executing n8n automation:", error);
    throw error;
  }
};

const n8nService = {
  getN8nAutomations,
  createN8nAutomation,
  updateN8nAutomation,
  deleteN8nAutomation,
  testN8nAutomation,
  validateN8nAutomationData,
  executeN8nAutomation,
};

export default n8nService;
export type { N8nAutomation, ApiResponse };
