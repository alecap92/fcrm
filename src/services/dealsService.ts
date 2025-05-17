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
    pagination: PaginationParams = { limit: 10, page: 1 }
  ): Promise<any> {
    return apiService.get<PaginatedResponse<Deal>>(
      `${this.baseUrl}?limit=${pagination?.limit}&page=${pagination?.page}&pipelineId=${pipelineId}`
    );
  }

  public async getDealsFields(pipelineId: string): Promise<any> {
    return apiService.get<any[]>(`/deals-fields?pipelineId=${pipelineId}`);
  }

  public async getStatuses(pipelineId: string): Promise<any> {
    return apiService.get<string[]>(`/status?pipelineId=${pipelineId}`);
  }

  public async getDealById(id: string): Promise<any> {
    return apiService.get<Deal>(`${this.baseUrl}/${id}`);
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

  public async bulkDeleteDeals(ids: string[]): Promise<void> {
    return apiService.delete(`${this.baseUrl}/`, { ids });
  }

  public async updateDealStage(id: string, stage: string): Promise<Deal> {
    return apiService.put<Deal>(`${this.baseUrl}/${id}/stage`, { stage });
  }

  public async getPipelines(): Promise<any> {
    return apiService.get<any[]>(`/pipelines`);
  }
}

export const dealsService = DealsService.getInstance();
