import { apiService } from "../config/apiConfig";

// Interfaces
export interface WebhookEndpoint {
  id: string;
  name: string;
  module: string;
  event: string;
  secret: string;
  status: "active" | "inactive";
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  url?: string; // URL completa para llamar al webhook
}

export interface WebhookFilters {
  module?: string;
  event?: string;
  status?: "active" | "inactive" | "all";
  search?: string;
  page?: number;
  limit?: number;
}

// Servicio
class WebhookService {
  /**
   * Obtener todos los endpoints de webhook registrados
   * @param filters - Filtros opcionales
   */
  async getWebhookEndpoints(
    filters: WebhookFilters = {}
  ): Promise<{ data: WebhookEndpoint[]; total: number }> {
    const response = await apiService.get<{
      data: WebhookEndpoint[];
      total: number;
    }>("/webhook-endpoints", {
      params: filters,
    });
    return response.data;
  }

  /**
   * Obtener un endpoint de webhook específico
   * @param id - ID del endpoint
   */
  async getWebhookEndpoint(id: string): Promise<WebhookEndpoint> {
    const response = await apiService.get<{ data: WebhookEndpoint }>(
      `/webhook-endpoints/${id}`
    );
    return response.data.data;
  }

  /**
   * Crear un nuevo endpoint de webhook
   * @param webhookData - Datos del webhook
   */
  async createWebhookEndpoint(
    webhookData: Partial<WebhookEndpoint>
  ): Promise<WebhookEndpoint> {
    return await apiService.post<WebhookEndpoint>(
      "/webhook-endpoints",
      webhookData
    );
  }

  /**
   * Actualizar un endpoint de webhook existente
   * @param id - ID del endpoint
   * @param webhookData - Datos actualizados
   */
  async updateWebhookEndpoint(
    id: string,
    webhookData: Partial<WebhookEndpoint>
  ): Promise<WebhookEndpoint> {
    return await apiService.put<WebhookEndpoint>(
      `/webhook-endpoints/${id}`,
      webhookData
    );
  }

  /**
   * Eliminar un endpoint de webhook
   * @param id - ID del endpoint
   */
  async deleteWebhookEndpoint(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    return await apiService.delete<{ success: boolean; message: string }>(
      `/webhook-endpoints/${id}`
    );
  }

  /**
   * Regenerar el secreto de un endpoint de webhook
   * @param id - ID del endpoint
   */
  async regenerateWebhookSecret(id: string): Promise<{ secret: string }> {
    return await apiService.post<{ secret: string }>(
      `/webhook-endpoints/${id}/regenerate-secret`,
      {}
    );
  }

  /**
   * Verificar un webhook (útil para probar la configuración)
   * @param id - ID del endpoint
   */
  async verifyWebhook(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiService.get<{
      success: boolean;
      message: string;
    }>(`/webhooks/${id}/verify`);
    return response.data;
  }
}

export const webhookService = new WebhookService();
