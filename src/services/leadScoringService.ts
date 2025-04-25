import { apiService } from "../config/apiConfig";
import { ScoringRule, LeadScoringStats } from "../types/leadScoring";

const BASE_URL = "/scoring-rules";

export const leadScoringService = {
  // Obtener todas las reglas de scoring
  getRules: async (): Promise<ScoringRule[]> => {
    const response = await apiService.get<ScoringRule[]>(`${BASE_URL}`);
    return response.data;
  },

  // Obtener una regla específica
  getRule: async (id: string): Promise<ScoringRule> => {
    const response = await apiService.get<ScoringRule>(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Crear una nueva regla
  createRule: async (
    rule: Omit<ScoringRule, "id" | "createdAt" | "updatedAt">
  ): Promise<ScoringRule> => {
    return apiService.post<ScoringRule>(`${BASE_URL}`, rule);
  },

  // Actualizar una regla existente
  updateRule: async (
    id: string,
    rule: Partial<ScoringRule>
  ): Promise<ScoringRule> => {
    return apiService.put<ScoringRule>(`${BASE_URL}/${id}`, rule);
  },

  // Eliminar una regla
  deleteRule: async (id: string): Promise<void> => {
    await apiService.delete(`${BASE_URL}/${id}`);
  },

  // Cambiar el estado de activación de una regla
  toggleRuleStatus: async (
    id: string,
    isActive: boolean
  ): Promise<ScoringRule> => {
    return apiService.patch<ScoringRule>(`${BASE_URL}/${id}/status`, {
      isActive,
    });
  },

  // Obtener estadísticas de lead scoring
  getStats: async (): Promise<LeadScoringStats> => {
    const response = await apiService.get<LeadScoringStats>(
      `${BASE_URL}/stats`
    );
    return response.data;
  },

  // Previsualizar el impacto de una regla
  previewRuleImpact: async (
    rule: Partial<ScoringRule>
  ): Promise<{
    affectedContacts: number;
    examples: {
      contactId: string;
      name: string;
      currentScore: number;
      newScore: number;
    }[];
  }> => {
    return apiService.post<{
      affectedContacts: number;
      examples: {
        contactId: string;
        name: string;
        currentScore: number;
        newScore: number;
      }[];
    }>(`${BASE_URL}/preview-impact`, rule);
  },
};
