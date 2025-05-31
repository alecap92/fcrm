import { AxiosResponse } from "axios";
import { apiService } from "../config/apiConfig";

// Define the Integration interface
interface Integration {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive";
  // Add other properties as needed
}

// Define response types
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

const getIntegrations = async (): Promise<any> => {
  const response = await apiService.get<
    AxiosResponse<ApiResponse<Integration[]>>
  >("/integrations");
  return response; // Access the data from the Axios response
};

// Add other endpoints as needed, for example:
const getIntegrationById = async (id: string): Promise<any> => {
  return await apiService.get<ApiResponse<Integration>>(`/integrations/${id}`);
};

const createIntegration = async (data: any): Promise<any> => {
  return await apiService.post<ApiResponse<Integration>>("/integrations", data);
};

const updateIntegration = async (
  id: string,
  data: Partial<Integration>
): Promise<ApiResponse<Integration>> => {
  return await apiService.put<ApiResponse<Integration>>(
    `/integrations/${id}`,
    data
  );
};

const deleteIntegration = async (id: string): Promise<ApiResponse<void>> => {
  return await apiService.delete<ApiResponse<void>>(`/integrations/${id}`);
};

// Verificar si existe una integración de WhatsApp activa
const checkWhatsAppIntegration = async (): Promise<boolean> => {
  try {
    const response = await getIntegrations();
    // El backend devuelve directamente el array de integraciones
    const integrations = response.data || [];

    // Buscar integración de WhatsApp activa
    const whatsappIntegration = integrations.find(
      (integration: any) =>
        integration.service === "whatsapp" &&
        integration.isActive &&
        integration.credentials?.accessToken &&
        (integration.credentials?.numberIdIdentifier ||
          integration.credentials?.phoneNumberId)
    );

    return !!whatsappIntegration;
  } catch (error) {
    console.error("Error verificando integración de WhatsApp:", error);
    return false;
  }
};

const integrationService = {
  getIntegrations,
  getIntegrationById,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  checkWhatsAppIntegration,
};

export default integrationService;
