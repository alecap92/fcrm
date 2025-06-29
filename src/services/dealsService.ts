import { apiService } from "../config/apiConfig";
import type { PaginationParams, PaginatedResponse } from "../types/contact";
import { Deal } from "../types/deal";

// You'll need to create these types in your types folder

class DealsService {
  private static instance: DealsService;
  private baseUrl = "/deals";

  private constructor() {}

  public static getInstance(): DealsService {
    if (!DealsService.instance) {
      DealsService.instance = new DealsService();
    }
    return DealsService.instance;
  }

  public async getDeals(
    pipelineId: string,
    pagination: PaginationParams = { limit: 20, page: 1 }
  ): Promise<PaginatedResponse<Deal>> {
    try {
      const response = await apiService.get<PaginatedResponse<Deal>>(
        `${this.baseUrl}?limit=${pagination?.limit}&page=${pagination?.page}&pipelineId=${pipelineId}`
      );

      // Verificar si el backend devolvió un array directamente (formato incorrecto)
      if (Array.isArray(response.data)) {
        const deals = response.data as Deal[];
        const currentPage = pagination.page || 1;
        const limit = pagination.limit || 20;

        // Simular paginación del lado del cliente
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedDeals = deals.slice(startIndex, endIndex);

        return {
          data: paginatedDeals,
          total: deals.length,
          page: currentPage,
          limit: limit,
          totalPages: Math.ceil(deals.length / limit),
        };
      }

      // Si tiene el formato correcto, devolverlo tal como está
      return response.data;
    } catch (error) {
      console.error("❌ dealsService.getDeals - Error detallado:", {
        error,
        errorMessage:
          error instanceof Error ? error.message : "Error desconocido",
        errorCode: (error as any)?.code,
        errorStatus: (error as any)?.status,
        pipelineId,
        pagination,
        environment: import.meta.env.MODE,
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      });

      // Devolver estructura consistente en caso de error
      return {
        data: [],
        total: 0,
        page: pagination.page || 1,
        limit: pagination.limit || 20,
        totalPages: 0,
      };
    }
  }

  public async getDealsFields(pipelineId: string): Promise<any> {
    try {
      const response = await apiService.get<any[]>(
        `/deals-fields?pipelineId=${pipelineId}`
      );
      return { data: response.data };
    } catch (error) {
      console.error("Error getting deals fields:", error);
      return { data: [] };
    }
  }

  public async getStatuses(pipelineId: string): Promise<any> {
    try {
      const response = await apiService.get<any[]>(
        `/status?pipelineId=${pipelineId}`
      );
      return { data: response.data };
    } catch (error) {
      console.error("Error getting statuses:", error);
      return { data: [] };
    }
  }

  public async getDealById(id: string): Promise<any> {
    try {
      const response = await apiService.get<{
        deal?: Deal;
        fields?: any[];
        dealProducts?: any[];
      }>(`${this.baseUrl}/${id}`);
      console.log("🔍 Respuesta del servidor en getDealById:", response);

      // Si la respuesta tiene una estructura anidada
      if (response.data && response.data.deal) {
        return {
          data: {
            ...response.data.deal,
            dealProducts:
              response.data.deal.dealProducts ||
              response.data.dealProducts ||
              [],
            fields: response.data.fields || [],
          },
        };
      }

      // Si la respuesta ya tiene el formato esperado
      return {
        data: {
          ...response.data,
          dealProducts: response.data.dealProducts || [],
        },
      };
    } catch (error) {
      console.error("Error en getDealById:", error);
      throw error;
    }
  }

  public async createDeal(
    deal: Omit<Deal, "id" | "createdAt" | "updatedAt">
  ): Promise<any> {
    return apiService.post<Deal>(this.baseUrl, deal);
  }

  public async updateDeal(id: string, deal: Partial<Deal>): Promise<Deal> {
    return apiService.put<any>(`${this.baseUrl}/${id}`, deal);
  }

  public async updateDealStatus(id: string, status: any): Promise<Deal> {
    return apiService.put<any>(`/deals/status/${id}`, status);
  }

  public async deleteDeal(id: string): Promise<void> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  public async searchDeals(query: string): Promise<any> {
    return apiService.get<any[]>(`${this.baseUrl}/search`, {
      params: {
        search: query,
      },
    });
  }

  // Nuevos métodos para estadísticas
  public async getDealsStats(
    pipelineId: string,
    period?: "current" | "previous"
  ): Promise<any> {
    try {
      const response = await apiService.get<any>(
        `${this.baseUrl}/stats?pipelineId=${pipelineId}&period=${
          period || "current"
        }`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting deals stats:", error);
      throw error;
    }
  }

  public async getMonthlyStats(
    pipelineId: string,
    year?: number,
    month?: number
  ): Promise<any> {
    try {
      const currentDate = new Date();
      const targetYear = year || currentDate.getFullYear();
      const targetMonth = month !== undefined ? month : currentDate.getMonth();

      const response = await apiService.get<any>(
        `${this.baseUrl}/stats/monthly?pipelineId=${pipelineId}&year=${targetYear}&month=${targetMonth}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting monthly stats:", error);
      throw error;
    }
  }

  public async getTopSellingProducts(
    period?: "current" | "previous",
    limit?: number
  ): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (period) params.append("period", period);
      if (limit) params.append("limit", limit.toString());

      const response = await apiService.get<any>(
        `${this.baseUrl}/stats/top-products?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting top selling products:", error);
      throw error;
    }
  }

  public async bulkDeleteDeals(ids: string[]): Promise<void> {
    return apiService.delete(`${this.baseUrl}/`, { ids });
  }

  public async updateDealStage(id: string, stage: string): Promise<Deal> {
    return apiService.put<Deal>(`${this.baseUrl}/${id}/stage`, { stage });
  }

  public async getPipelines(): Promise<any> {
    try {
      const response = await apiService.get<any[]>(`/pipelines`);
      return { data: response.data };
    } catch (error) {
      console.error("Error getting pipelines:", error);
      return { data: [] };
    }
  }

  // Pipeline CRUD operations
  public async createPipeline(pipeline: any): Promise<any> {
    try {
      const response = await apiService.post<any>(`/pipelines`, pipeline);
      return { data: response };
    } catch (error) {
      console.error("Error creating pipeline:", error);
      throw error;
    }
  }

  public async updatePipeline(id: string, pipeline: any): Promise<any> {
    try {
      const response = await apiService.put<any>(`/pipelines/${id}`, pipeline);
      return { data: response };
    } catch (error) {
      console.error("Error updating pipeline:", error);
      throw error;
    }
  }

  public async deletePipeline(id: string): Promise<void> {
    try {
      await apiService.delete(`/pipelines/${id}`);
    } catch (error) {
      console.error("Error deleting pipeline:", error);
      throw error;
    }
  }

  // Status/Column CRUD operations
  public async createStatus(status: any): Promise<any> {
    try {
      const response = await apiService.post<any>(`/status`, status);
      return { data: response };
    } catch (error) {
      console.error("Error creating status:", error);
      throw error;
    }
  }

  public async updateStatus(id: string, status: any): Promise<any> {
    try {
      const response = await apiService.put<any>(`/status/${id}`, status);
      return { data: response };
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  }

  public async deleteStatus(id: string): Promise<void> {
    try {
      await apiService.delete(`/status/${id}`);
    } catch (error) {
      console.error("Error deleting status:", error);
      throw error;
    }
  }

  // Verificar si un status tiene deals asociados
  public async checkStatusHasDeals(
    statusId: string
  ): Promise<{ hasDeals: boolean; count: number }> {
    try {
      const response = await apiService.get<{
        hasDeals: boolean;
        count: number;
      }>(`/status/${statusId}/deals-count`);
      return response.data;
    } catch (error) {
      console.error("Error checking status deals:", error);
      // Si hay error, asumir que puede tener deals por seguridad
      return { hasDeals: true, count: 0 };
    }
  }

  public async reorderStatuses(
    pipelineId: string,
    statusIds: string[]
  ): Promise<any> {
    return apiService.put<any>(`/status/reorder`, { pipelineId, statusIds });
  }

  // Deals Fields CRUD operations - Corregir rutas según el backend
  public async createDealField(field: any): Promise<any> {
    try {
      const response = await apiService.post<any>(
        `/deals-fields/create`,
        field
      );
      return { data: response };
    } catch (error) {
      console.error("Error creating deal field:", error);
      throw error;
    }
  }

  public async updateDealField(id: string, field: any): Promise<any> {
    try {
      const response = await apiService.put<any>(
        `/deals-fields/edit/${id}`,
        field
      );
      return { data: response };
    } catch (error) {
      console.error("Error updating deal field:", error);
      throw error;
    }
  }

  public async deleteDealField(id: string): Promise<void> {
    try {
      await apiService.delete(`/deals-fields/delete/${id}`);
    } catch (error) {
      console.error("Error deleting deal field:", error);
      throw error;
    }
  }

  public async getDealProducts(dealId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(
        `/product-acquisitions?dealId=${dealId}`
      );
      console.log("🛍️ Productos del trato obtenidos:", response);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo productos del trato:", error);
      return { data: [] };
    }
  }
}

export const dealsService = DealsService.getInstance();
