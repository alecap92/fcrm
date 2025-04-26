import { apiService } from "../config/apiConfig";
import { ScoringRule } from "../types/leadScoring";

const BASE_URL = "/scoring-rules";

// Normalizar una regla desde el formato del servidor (rules) al formato del cliente (conditions)
const normalizeRule = (rule: any): ScoringRule => {
  if (!rule) return rule;

  let normalizedRule: ScoringRule = {
    ...rule,
    // Mantener id o usar _id si existe
    id: rule.id || rule._id,
  };

  // Si la regla tiene rules pero no conditions, usamos rules como conditions
  if (rule.rules && !rule.conditions) {
    normalizedRule.conditions = rule.rules;
  }

  return normalizedRule;
};

// Preparar regla para enviar al servidor (de conditions a rules)
const prepareRuleForServer = (rule: Partial<ScoringRule>): any => {
  const serverRule = { ...rule };

  // Si tenemos conditions pero no rules, usamos conditions como rules
  if (rule.conditions && !rule.rules) {
    serverRule.rules = rule.conditions;
  }

  // Preferir _id sobre id para el servidor
  if (rule.id && !rule._id) {
    serverRule._id = rule.id;
    delete serverRule.id;
  }

  return serverRule;
};

export const leadScoringService = {
  // Obtener todas las reglas de scoring
  getRules: async (): Promise<ScoringRule[]> => {
    try {
      console.log("Obteniendo reglas de puntuación");
      const response = await apiService.get<any>(`${BASE_URL}`);
      console.log("Respuesta con reglas:", response);
      const rules = response.data;

      if (Array.isArray(rules)) {
        return rules.map(normalizeRule);
      } else if (rules && Array.isArray(rules.data)) {
        return rules.data.map(normalizeRule);
      }

      // Fallback: devolver array vacío para evitar errores
      console.warn("Formato de respuesta inesperado:", rules);
      return [];
    } catch (error) {
      console.error("Error al obtener reglas:", error);
      throw error;
    }
  },

  // Obtener una regla específica
  getRule: async (id: string): Promise<ScoringRule> => {
    try {
      console.log(`Obteniendo regla con id: ${id}`);
      const response = await apiService.get<any>(`${BASE_URL}/${id}`);
      const rule = response.data;
      return normalizeRule(rule);
    } catch (error) {
      console.error(`Error al obtener regla ${id}:`, error);
      throw error;
    }
  },

  // Crear una nueva regla
  createRule: async (
    rule: Omit<ScoringRule, "id" | "_id" | "createdAt" | "updatedAt">
  ): Promise<ScoringRule> => {
    try {
      console.log("Creando nueva regla:", rule);
      const ruleForServer = prepareRuleForServer(rule);
      // post ya devuelve directamente data
      const result = await apiService.post<any>(`${BASE_URL}`, ruleForServer);
      return normalizeRule(result);
    } catch (error) {
      console.error("Error al crear regla:", error);
      throw error;
    }
  },

  // Actualizar una regla existente
  updateRule: async (
    id: string,
    rule: Partial<ScoringRule>
  ): Promise<ScoringRule> => {
    try {
      console.log(`Actualizando regla ${id}:`, rule);
      const ruleForServer = prepareRuleForServer(rule);
      // put ya devuelve directamente data
      const result = await apiService.put<any>(
        `${BASE_URL}/${id}`,
        ruleForServer
      );
      return normalizeRule(result);
    } catch (error) {
      console.error(`Error al actualizar regla ${id}:`, error);
      throw error;
    }
  },

  // Eliminar una regla
  deleteRule: async (id: string): Promise<void> => {
    try {
      console.log(`Eliminando regla ${id}`);
      await apiService.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Error al eliminar regla ${id}:`, error);
      throw error;
    }
  },

  // Cambiar el estado de activación de una regla
  toggleRuleStatus: async (
    id: string,
    isActive: boolean
  ): Promise<ScoringRule> => {
    try {
      console.log(
        `Cambiando estado de regla ${id} a ${isActive ? "activa" : "inactiva"}`
      );
      // patch ya devuelve directamente data
      const result = await apiService.patch<any>(`${BASE_URL}/${id}/status`, {
        isActive,
      });
      return normalizeRule(result);
    } catch (error) {
      console.error(`Error al cambiar estado de regla ${id}:`, error);
      throw error;
    }
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
    try {
      console.log("Previsualizando impacto de regla:", rule);
      const ruleForServer = prepareRuleForServer(rule);
      // post ya devuelve directamente data
      return await apiService.post<any>(
        `${BASE_URL}/preview-impact`,
        ruleForServer
      );
    } catch (error) {
      console.error("Error al previsualizar impacto:", error);
      throw error;
    }
  },
};
