import React, { useState, useEffect } from "react";
import { Bot, Play, Settings } from "lucide-react";
import { useToast } from "../../ui/toast";
import n8nService, { N8nAutomation } from "../../../services/n8nService";
import { useNavigate } from "react-router-dom";
import { AutomationDataModal } from "./AutomationDataModal";
import { parseN8nError } from "../../../utils/n8nErrorHandler";

interface AutomationsSectionProps {
  conversationId: string;
  contactId: string;
  organizationId: string;
  userId: string;
}

/*
Como hacemos para enviar el body de la automatizacion? Deberia tener un endpoint para ejecutarlas diferente al de listarla? 
Podria enviar algo como:
{
  automationId: string;
  body: any;
}
y que el backend se encargue de revisar si coincide con el body, escoger el method, y responder. 
pero como le pasamos el body? cual contexto necesitamos? // depende de la vista donde estemos.
En el contexto de la vista de chat, necesitamos el chat, preparar el formulario, y enviar la peticion. 
Deberia enviar el chat o que lo saque del backend? // que lo saque del backend. entonces deberia enviar el id de la conversacion, inclusive podria enviarle todo para que tenga mas contexto el back y asi elegir que enviar a n8n.
{
  conversationId: string;
  contactId: string;
  organizationId: string;
  userId: string;
  target: "chat" | "whatsapp" | "email" | "crm" | "custom" | "contactos";
}
*/

export const AutomationsSection: React.FC<AutomationsSectionProps> = ({
  conversationId,
  contactId,
  organizationId,
  userId,
}) => {
  const [automations, setAutomations] = useState<N8nAutomation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [executingAutomations, setExecutingAutomations] = useState<Set<string>>(
    new Set()
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] =
    useState<N8nAutomation | null>(null);
  const [isSubmittingData, setIsSubmittingData] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const fetchAutomations = async () => {
    const automations = await n8nService.getN8nAutomations();
    setAutomations(automations.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAutomations();
  }, [conversationId]);

  const handleExecuteAutomation = async (automation: N8nAutomation) => {
    // Si la automatización necesita datos, abrir el modal
    if (automation.needData) {
      setSelectedAutomation(automation);
      setModalOpen(true);
      return;
    }

    // Si no necesita datos, ejecutar directamente
    await executeAutomationWithData(automation);
  };

  const executeAutomationWithData = async (
    automation: N8nAutomation,
    additionalData?: string
  ) => {
    // Marcar como ejecutándose
    setExecutingAutomations((prev) => new Set(prev).add(automation._id));

    console.log({
      conversationId,
      contactId,
      organizationId,
      userId,
      additionalData,
    });

    try {
      const response = await n8nService.executeN8nAutomation(automation._id, {
        conversationId,
        contactId,
        organizationId,
        userId,
        target: ["Mensajes"],
        additionalData,
      });

      console.log(response.data, "ACA");

      if (response.data.statusCode === 404) {
        toast.show({
          title: "Error de N8N",
          description: "Automatización no encontrada o hook invalido",
          type: "error",
          duration: 10000,
        });
        return;
      }

      if (response.data.statusCode === 500) {
        toast.show({
          title: "Error Interno del Servidor",
          description: response.data.response.error,
          type: "error",
          duration: 10000,
        });
        return;
      }

      toast.show({
        title: "✅ Éxito",
        description: `Automatización "${automation.name}" ejecutada correctamente`,
        type: "success",
      });
    } catch (error: any) {
      console.error("Error ejecutando automatización:", error);

      // Usar la utilidad para procesar el error
      const errorInfo = parseN8nError(error, automation.name);

      toast.show({
        title: errorInfo.title,
        description: errorInfo.description,
        type: "error",
      });
    } finally {
      // Remover de ejecutándose
      setExecutingAutomations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(automation._id);
        return newSet;
      });
    }
  };

  const handleModalSubmit = async (data: string) => {
    if (!selectedAutomation) return;

    setIsSubmittingData(true);
    try {
      await executeAutomationWithData(selectedAutomation, data);
      setModalOpen(false);
      setSelectedAutomation(null);
    } catch (error) {
      console.error("Error submitting automation data:", error);
    } finally {
      setIsSubmittingData(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAutomation(null);
  };

  return (
    <div className="border-b border-gray-200 pb-4 px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bot className="w-4 h-4 text-gray-500 mr-2" />
          <h3 className="font-semibold text-gray-900">Automatizaciones</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/settings/n8n")}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Configurar automatizaciones"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="text-sm text-gray-500 text-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
            Cargando automatizaciones...
          </div>
        ) : automations.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">
              No hay automatizaciones disponibles
            </p>
            <p className="text-xs text-gray-400">
              Configura automatizaciones en el panel de administración
            </p>
            <button
              onClick={() => navigate("/settings/n8n")}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Ir a configuración
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {automations.map((automation) => {
              const isExecuting = executingAutomations.has(automation._id);

              return (
                <div
                  key={automation._id}
                  className="px-3 py-2.5 bg-white rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm truncate">
                          {automation.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <button
                        onClick={() => handleExecuteAutomation(automation)}
                        disabled={isExecuting}
                        className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                          isExecuting
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer"
                        }`}
                        title={
                          isExecuting
                            ? "Ejecutando..."
                            : automation.needData
                            ? "Ejecutar (requiere datos)"
                            : "Ejecutar"
                        }
                      >
                        {isExecuting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para automatizaciones que requieren datos */}
      <AutomationDataModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        automation={selectedAutomation}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmittingData}
      />
    </div>
  );
};

export default AutomationsSection;
