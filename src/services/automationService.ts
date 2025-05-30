import { apiService } from "../config/apiConfig";

// src/services/automationService.ts

// ===== INTERFACES UNIFICADAS =====
export interface Automation {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  isActive: boolean;
  organizationId: string;
  createdBy: string;
  nodes: AutomationNode[];
  triggerType?: string;
  automationType?: string;
  stats?: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    lastExecutedAt?: Date;
  };
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
  automationType?: string;
  isActive?: boolean;
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

export interface AutomationSettings {
  isPaused: boolean;
  pausedUntil?: Date;
  pausedBy?: string;
  pauseReason?: string;
  lastAutomationTriggered?: Date;
  automationHistory: Array<{
    automationType: string;
    triggeredAt: Date;
    triggeredBy?: string;
  }>;
}

export interface AutomationResponse {
  success: boolean;
  message?: string;
  data: {
    automationSettings?: AutomationSettings;
    isActive?: boolean;
    history?: Array<{
      automationType: string;
      triggeredAt: Date;
      triggeredBy?: {
        firstName: string;
        lastName: string;
        email: string;
      };
    }>;
    canTrigger?: boolean;
  };
}

// ===== SERVICIO PRINCIPAL UNIFICADO =====
class AutomationService {
  // ===== OPERACIONES CRUD =====

  /**
   * Obtener todas las automatizaciones con filtros opcionales
   */
  async getAutomations(filters: AutomationFilters = {}): Promise<Automation[]> {
    try {
      const response = await apiService.get<Automation[]>("/automations", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching automations:", error);
      throw error;
    }
  }

  /**
   * Obtener una automatización específica por ID
   */
  async getAutomation(id: string): Promise<Automation> {
    try {
      const response = await apiService.get<Automation>(`/automations/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching automation:", error);
      throw error;
    }
  }

  /**
   * Crear una nueva automatización
   */
  async createAutomation(
    automationData: Partial<Automation>
  ): Promise<Automation> {
    try {
      const response = await apiService.post<Automation>(
        "/automations",
        automationData
      );
      return response;
    } catch (error) {
      console.error("Error creating automation:", error);
      throw error;
    }
  }

  /**
   * Actualizar una automatización existente
   */
  async updateAutomation(
    id: string,
    automationData: Partial<Automation>
  ): Promise<Automation> {
    try {
      const response = await apiService.put<Automation>(
        `/automations/${id}`,
        automationData
      );
      return response;
    } catch (error) {
      console.error("Error updating automation:", error);
      throw error;
    }
  }

  /**
   * Eliminar una automatización
   */
  async deleteAutomation(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.delete<{
        success: boolean;
        message: string;
      }>(`/automations/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting automation:", error);
      throw error;
    }
  }

  /**
   * Activar o desactivar una automatización
   */
  async toggleAutomationActive(id: string): Promise<Automation> {
    try {
      const response = await apiService.post<Automation>(
        `/automations/${id}/toggle`,
        {}
      );
      return response;
    } catch (error) {
      console.error("Error toggling automation status:", error);
      throw error;
    }
  }

  /**
   * Ejecutar manualmente una automatización
   */
  async executeAutomation(
    id: string,
    inputData: Record<string, any> = {}
  ): Promise<{ executionId: string }> {
    try {
      const response = await apiService.post<{ executionId: string }>(
        `/automations/${id}/execute`,
        inputData
      );
      return response;
    } catch (error) {
      console.error("Error executing automation:", error);
      throw error;
    }
  }

  /**
   * Obtener historial de ejecuciones
   */
  async getExecutionHistory(id: string): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(
        `/automations/${id}/executions`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching execution history:", error);
      throw error;
    }
  }

  // ===== CATÁLOGOS Y METADATOS =====

  /**
   * Obtener tipos de nodos disponibles
   */
  async getNodeTypes(): Promise<NodeType[]> {
    try {
      const response = await apiService.get<NodeType[]>(
        "/automations/nodes/types"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching node types:", error);
      throw error;
    }
  }

  /**
   * Obtener módulos y eventos disponibles para automatizaciones
   */
  async getAvailableModules(): Promise<ModuleEvent[]> {
    try {
      const response = await apiService.get<ModuleEvent[]>(
        "/automations/modules"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching available modules:", error);
      throw error;
    }
  }
}

// ===== SERVICIOS DE CONVERSACIÓN =====

/**
 * Pausa las automatizaciones para una conversación
 */
export const pauseAutomations = async (
  conversationId: string,
  duration: string
): Promise<AutomationResponse> => {
  try {
    const response = await apiService.post<AutomationResponse>(
      `/conversation/${conversationId}/automations/pause`,
      { duration }
    );
    return response;
  } catch (error) {
    console.error("Error pausando automatizaciones:", error);
    throw error;
  }
};

/**
 * Reanuda las automatizaciones para una conversación
 */
export const resumeAutomations = async (
  conversationId: string
): Promise<AutomationResponse> => {
  try {
    const response = await apiService.post<AutomationResponse>(
      `/conversation/${conversationId}/automations/resume`
    );
    return response;
  } catch (error) {
    console.error("Error reanudando automatizaciones:", error);
    throw error;
  }
};

/**
 * Obtiene el estado de automatizaciones de una conversación
 */
export const getAutomationStatus = async (
  conversationId: string
): Promise<AutomationResponse> => {
  try {
    const response = await apiService.get<AutomationResponse>(
      `/conversation/${conversationId}/automations/status`
    );
    return response.data;
  } catch (error) {
    console.error("Error obteniendo estado de automatizaciones:", error);
    throw error;
  }
};

/**
 * Obtiene el historial de automatizaciones de una conversación
 */
export const getAutomationHistory = async (
  conversationId: string
): Promise<AutomationResponse> => {
  try {
    const response = await apiService.get<AutomationResponse>(
      `/conversation/${conversationId}/automations/history`
    );
    return response.data;
  } catch (error) {
    console.error("Error obteniendo historial de automatizaciones:", error);
    throw error;
  }
};

/**
 * Verifica si una automatización específica puede ejecutarse
 */
export const canTriggerAutomation = async (
  conversationId: string,
  automationType: string
): Promise<AutomationResponse> => {
  try {
    const response = await apiService.get<AutomationResponse>(
      `/conversation/${conversationId}/automations/can-trigger?automationType=${automationType}`
    );
    return response.data;
  } catch (error) {
    console.error("Error verificando automatización:", error);
    throw error;
  }
};

// ===== INSTANCIA SINGLETON =====
export const automationService = new AutomationService();

// ===== COMPATIBILIDAD CON CÓDIGO EXISTENTE =====
// Mantenemos automationSystemService para compatibilidad hacia atrás
export const automationSystemService = {
  getAutomations: () => automationService.getAutomations(),
  getAutomation: (id: string) => automationService.getAutomation(id),
  createAutomation: (automation: Partial<Automation>) =>
    automationService.createAutomation(automation),
  updateAutomation: (id: string, automation: Partial<Automation>) =>
    automationService.updateAutomation(id, automation),
  deleteAutomation: (id: string) => automationService.deleteAutomation(id),
  toggleAutomationStatus: (id: string) =>
    automationService.toggleAutomationActive(id),
  executeAutomation: (id: string, testData?: any) =>
    automationService.executeAutomation(id, testData),
  getExecutionHistory: (id: string) =>
    automationService.getExecutionHistory(id),
};
