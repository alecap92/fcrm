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
    pagination?: PaginationParams
  ): Promise<any> {
    return apiService.get<PaginatedResponse<Deal>>(
      `${this.baseUrl}?limit=${pagination?.limit}&page=${pagination?.page}&pipelineId=${pipelineId}`
    );
  }

  public async getStatuses(pipelineId: string): Promise<any> {
    return apiService.get<string[]>(`/status?pipelineId=${pipelineId}`);
  }

  public async getDealById(id: string): Promise<Deal> {
    return apiService.get<Deal>(`${this.baseUrl}/${id}`);
  }

  public async createDeal(
    deal: Omit<Deal, "id" | "createdAt" | "updatedAt">
  ): Promise<Deal> {
    return apiService.post<Deal>(this.baseUrl, deal);
  }

  public async updateDeal(id: string, deal: Partial<Deal>): Promise<Deal> {
    return apiService.put<Deal>(`${this.baseUrl}/${id}`, deal);
  }

  public async updateDealStatus(id: string, status: any): Promise<Deal> {
    return apiService.put<Deal>(`/deals/status/${id}`, status);
  }

  public async deleteDeal(id: string): Promise<void> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  public async searchDeals(query: string): Promise<Deal[]> {
    return apiService.get<Deal[]>(`${this.baseUrl}/search`, {
      search: query,
    });
  }

  public async bulkDeleteDeals(ids: string[]): Promise<void> {
    return apiService.delete(`${this.baseUrl}/`, { ids });
  }

  public async updateDealStage(id: string, stage: string): Promise<Deal> {
    return apiService.put<Deal>(`${this.baseUrl}/${id}/stage`, { stage });
  }
}

export const dealsService = DealsService.getInstance();
