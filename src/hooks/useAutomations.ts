import { useState, useCallback } from "react";
import {
  automationService,
  Automation,
  AutomationFilters,
} from "../services/automationService";
import { useToast } from "../components/ui/toast";

interface UseAutomationsReturn {
  automations: Automation[];
  loading: boolean;
  error: string | null;
  fetchAutomations: (filters?: AutomationFilters) => Promise<void>;
  toggleAutomationActive: (id: string) => Promise<void>;
  deleteAutomation: (id: string) => Promise<void>;
  executeAutomation: (id: string) => Promise<void>;
  clearError: () => void;
}

export function useAutomations(): UseAutomationsReturn {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchAutomations = useCallback(
    async (filters?: AutomationFilters) => {
      try {
        setLoading(true);
        setError(null);
        const data = await automationService.getAutomations(filters);
        setAutomations(data);
      } catch (err) {
        const errorMessage = "No se pudieron cargar las automatizaciones";
        setError(errorMessage);
        toast.show({
          title: "Error",
          description: errorMessage,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const toggleAutomationActive = useCallback(
    async (id: string) => {
      try {
        const updatedAutomation =
          await automationService.toggleAutomationActive(id);
        setAutomations((current) =>
          current.map((automation) =>
            automation.id === id
              ? {
                  ...automation,
                  isActive: updatedAutomation.isActive,
                  status: updatedAutomation.isActive ? "active" : "inactive",
                }
              : automation
          )
        );
        toast.show({
          title: "Estado actualizado",
          description: `Automatización ${
            updatedAutomation.isActive ? "activada" : "desactivada"
          }`,
          type: "success",
        });
      } catch (err) {
        const errorMessage =
          "No se pudo cambiar el estado de la automatización";
        setError(errorMessage);
        toast.show({
          title: "Error",
          description: errorMessage,
          type: "error",
        });
      }
    },
    [toast]
  );

  const deleteAutomation = useCallback(
    async (id: string) => {
      try {
        await automationService.deleteAutomation(id);
        setAutomations((current) =>
          current.filter((automation) => automation.id !== id)
        );
        toast.show({
          title: "Automatización eliminada",
          description: "La automatización se eliminó correctamente",
          type: "success",
        });
      } catch (err) {
        const errorMessage = "No se pudo eliminar la automatización";
        setError(errorMessage);
        toast.show({
          title: "Error",
          description: errorMessage,
          type: "error",
        });
      }
    },
    [toast]
  );

  const executeAutomation = useCallback(
    async (id: string) => {
      try {
        await automationService.executeAutomation(id);
        toast.show({
          title: "Automatización ejecutada",
          description: "La automatización se ejecutó manualmente",
          type: "success",
        });
      } catch (err) {
        const errorMessage = "No se pudo ejecutar la automatización";
        setError(errorMessage);
        toast.show({
          title: "Error",
          description: errorMessage,
          type: "error",
        });
      }
    },
    [toast]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    automations,
    loading,
    error,
    fetchAutomations,
    toggleAutomationActive,
    deleteAutomation,
    executeAutomation,
    clearError,
  };
}
