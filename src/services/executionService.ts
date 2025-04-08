import { apiService } from "../config/apiConfig";

// Interfaces
export interface ExecutionLog {
  id: string;
  automationId: string;
  organizationId: string;
  status: "success" | "failed" | "in_progress";
  startTime: string;
  endTime?: string;
  inputData: Record<string, any>;
  outputData?: Record<string, any>;
  error?: {
    message: string;
    nodeId?: string;
    details?: any;
  };
  nodesExecution: {
    nodeId: string;
    status: "success" | "failed" | "skipped" | "in_progress";
    startTime: string;
    endTime?: string;
    inputData: Record<string, any>;
    outputData?: Record<string, any>;
    error?: any;
  }[];
}

export interface ExecutionFilters {
  automationId?: string;
  status?: "success" | "failed" | "in_progress" | "all";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ExecutionStats {
  total: number;
  success: number;
  failed: number;
  inProgress: number;
  averageDuration: number; // en milisegundos
  byDay: {
    date: string;
    total: number;
    success: number;
    failed: number;
  }[];
}

// Servicio
class ExecutionService {
  /**
   * Obtener logs de ejecución con filtros
   * @param filters - Filtros
   */
  async getExecutionLogs(
    filters: ExecutionFilters = {}
  ): Promise<{ data: ExecutionLog[]; total: number }> {
    const response = await apiService.get<{
      data: ExecutionLog[];
      total: number;
    }>("/execution-logs", {
      params: filters,
    });
    return response.data;
  }

  /**
   * Obtener detalle de una ejecución específica
   * @param executionId - ID de la ejecución
   */
  async getExecutionDetail(executionId: string): Promise<ExecutionLog> {
    const response = await apiService.get<{ data: ExecutionLog }>(
      `/execution-logs/${executionId}`
    );
    return response.data.data;
  }

  /**
   * Obtener estadísticas de ejecuciones
   * @param filters - Filtros para las estadísticas
   */
  async getExecutionStats(
    filters: Omit<ExecutionFilters, "page" | "limit"> = {}
  ): Promise<ExecutionStats> {
    const response = await apiService.get<{ data: ExecutionStats }>(
      "/execution-logs/stats",
      {
        params: filters,
      }
    );
    return response.data.data;
  }

  /**
   * Obtener detalles de error para una ejecución fallida
   * @param executionId - ID de la ejecución
   */
  async getExecutionError(
    executionId: string
  ): Promise<{ error: any; logs: any[] }> {
    const response = await apiService.get<{
      data: { error: any; logs: any[] };
    }>(`/execution-logs/${executionId}/error`);
    return response.data.data;
  }

  /**
   * Obtener historial de ejecuciones para una automatización específica
   * @param automationId - ID de la automatización
   * @param filters - Filtros adicionales
   */
  async getAutomationExecutionHistory(
    automationId: string,
    filters: Omit<ExecutionFilters, "automationId"> = {}
  ): Promise<{ data: ExecutionLog[]; total: number }> {
    const params = { ...filters, automationId };
    const response = await apiService.get<{
      data: ExecutionLog[];
      total: number;
    }>("/execution-logs", {
      params,
    });
    return response.data;
  }
}

export const executionService = new ExecutionService();
