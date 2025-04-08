import { apiService } from "../config/apiConfig";

// src/services/automationService.ts

// Interfaces
export interface Automation {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  organizationId: string;
  createdBy: string;
  nodes: AutomationNode[];
  createdAt: string;
  updatedAt: string;
}

export interface AutomationNode {
  id: string;
  type: string;
  data: any;
  position: {
    x: number;
    y: number;
  };
  sourcePosition?: string;
  targetPosition?: string;
}

export interface AutomationFilters {
  status?: "active" | "inactive" | "all";
  search?: string;
  page?: number;
  limit?: number;
}

export interface NodeType {
  type: string;
  label: string;
  description: string;
  category: string;
  inputs: {
    type: string;
    name: string;
    label: string;
    required: boolean;
    default?: any;
    options?: any[];
  }[];
  outputs: {
    name: string;
    label: string;
    type: string;
  }[];
}

export interface ModuleEvent {
  module: string;
  event: string;
  description: string;
  payloadSchema: Record<string, any>;
}

// Servicio
class AutomationService {
  /**
   * Obtener todas las automatizaciones con filtros opcionales
   * @param filters - Filtros para la búsqueda
   */
  async getAutomations(filters: AutomationFilters = {}): Promise<any> {
    const response = await apiService.get<{
      data: Automation[];
      total: number;
    }>("/automations", { params: filters });
    return response.data;
  }

  /**
   * Obtener una automatización específica por ID
   * @param id - ID de la automatización
   */
  async getAutomation(id: string): Promise<Automation> {
    const response = await apiService.get<{ data: Automation }>(
      `/automations/${id}`
    );
    return response.data.data;
  }

  /**
   * Crear una nueva automatización
   * @param automationData - Datos de la automatización
   */
  async createAutomation(
    automationData: Partial<Automation>
  ): Promise<Automation> {
    return await apiService.post<Automation>("/automations", automationData);
  }

  /**
   * Actualizar una automatización existente
   * @param id - ID de la automatización
   * @param automationData - Datos actualizados
   */
  async updateAutomation(
    id: string,
    automationData: Partial<Automation>
  ): Promise<Automation> {
    return await apiService.put<Automation>(
      `/automations/${id}`,
      automationData
    );
  }

  /**
   * Eliminar una automatización
   * @param id - ID de la automatización a eliminar
   */
  async deleteAutomation(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    return await apiService.delete<{ success: boolean; message: string }>(
      `/automations/${id}`
    );
  }

  /**
   * Activar o desactivar una automatización
   * @param id - ID de la automatización
   */
  async toggleAutomationActive(id: string): Promise<Automation> {
    return await apiService.post<Automation>(`/automations/${id}/toggle`, {});
  }

  /**
   * Ejecutar manualmente una automatización
   * @param id - ID de la automatización
   * @param inputData - Datos de entrada para la ejecución
   */
  async executeAutomation(
    id: string,
    inputData: Record<string, any> = {}
  ): Promise<{ executionId: string }> {
    return await apiService.post<{ executionId: string }>(
      `/automations/${id}/execute`,
      inputData
    );
  }

  /**
   * Obtener tipos de nodos disponibles
   */
  async getNodeTypes(): Promise<NodeType[]> {
    const response = await apiService.get<{ data: NodeType[] }>(
      "/automations/nodes/types"
    );
    return response.data.data;
  }

  /**
   * Obtener módulos y eventos disponibles para automatizaciones
   */
  async getAvailableModules(): Promise<ModuleEvent[]> {
    const response = await apiService.get<{ data: ModuleEvent[] }>(
      "/automations/modules"
    );
    return response.data.data;
  }
}

export const automationService = new AutomationService();
