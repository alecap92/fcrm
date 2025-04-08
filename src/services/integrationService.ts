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

const integrationService = {
  getIntegrations,
  getIntegrationById,
  createIntegration,
  updateIntegration,
  deleteIntegration,
};

export default integrationService;
