import React, { useState, useEffect } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { ScoringRulesList } from "../leadScoring/ScoringRulesList";
import { ScoringRuleForm } from "../leadScoring/ScoringRuleForm";
import { ScoringRuleDetails } from "../leadScoring/ScoringRuleDetails";
import { ScorePreview } from "../leadScoring/ScorePreview";
import { ScoringRule } from "../../types/leadScoring";
import { leadScoringService } from "../../services/leadScoringService";
import { useToast } from "../ui/toast";

type ModalView = "create" | "edit" | "view" | "preview" | null;

export const LeadScoringSettings = () => {
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalView, setModalView] = useState<ModalView>(null);
  const [selectedRule, setSelectedRule] = useState<ScoringRule | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const rulesData = await leadScoringService.getRules();
      console.log("Reglas obtenidas:", rulesData);
      setRules(rulesData);
      setError(null);
    } catch (err) {
      setError("Error al cargar las reglas de puntuación");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (
    rule: Omit<ScoringRule, "id" | "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      console.log("Creando regla:", rule);
      await leadScoringService.createRule(rule);
      toast.show({
        title: "Regla creada con éxito",
        description: "La regla ha sido creada correctamente",
        type: "success",
      });
      setModalView(null);
      fetchRules();
    } catch (err) {
      console.error("Error al crear la regla:", err);
      toast.show({
        title: "Error al crear la regla",
        description: "Ha ocurrido un error al crear la regla",
        type: "error",
      });
    }
  };

  const handleUpdateRule = async (
    rule: Omit<ScoringRule, "id" | "_id" | "createdAt" | "updatedAt">
  ) => {
    if (!selectedRule) return;

    // Identificar el ID correcto para la actualización
    const ruleId = selectedRule.id || selectedRule._id;
    if (!ruleId) {
      console.error("Error: No se puede actualizar la regla sin ID");
      toast.show({
        title: "Error al actualizar",
        description: "No se pudo identificar la regla para actualizar",
        type: "error",
      });
      return;
    }

    try {
      console.log(`Actualizando regla con ID ${ruleId}:`, rule);
      await leadScoringService.updateRule(ruleId, rule);
      toast.show({
        title: "Regla actualizada con éxito",
        description: "La regla ha sido actualizada correctamente",
        type: "success",
      });
      setModalView(null);
      fetchRules();
    } catch (err) {
      console.error("Error al actualizar la regla:", err);
      toast.show({
        title: "Error al actualizar la regla",
        description: "Ha ocurrido un error al actualizar la regla",
        type: "error",
      });
    }
  };

  const handleDeleteRule = async (rule: ScoringRule) => {
    // Identificar el ID correcto para la eliminación
    const ruleId = rule.id || rule._id;
    if (!ruleId) {
      console.error("Error: No se puede eliminar la regla sin ID");
      toast.show({
        title: "Error al eliminar",
        description: "No se pudo identificar la regla para eliminar",
        type: "error",
      });
      return;
    }

    if (!window.confirm("¿Estás seguro de que deseas eliminar esta regla?"))
      return;

    try {
      await leadScoringService.deleteRule(ruleId);
      toast.show({
        title: "Regla eliminada con éxito",
        description: "La regla ha sido eliminada correctamente",
        type: "success",
      });
      fetchRules();
    } catch (err) {
      console.error("Error al eliminar la regla:", err);
      toast.show({
        title: "Error al eliminar la regla",
        description: "Ha ocurrido un error al eliminar la regla",
        type: "error",
      });
    }
  };

  const handleToggleStatus = async (rule: ScoringRule) => {
    // Identificar el ID correcto para cambiar el estado
    const ruleId = rule.id || rule._id;
    if (!ruleId) {
      console.error("Error: No se puede cambiar el estado de la regla sin ID");
      toast.show({
        title: "Error al cambiar estado",
        description: "No se pudo identificar la regla para cambiar su estado",
        type: "error",
      });
      return;
    }

    try {
      await leadScoringService.toggleRuleStatus(ruleId, !rule.isActive);
      toast.show({
        title: `Regla ${rule.isActive ? "desactivada" : "activada"} con éxito`,
        type: "success",
      });
      fetchRules();
    } catch (err) {
      console.error("Error al cambiar el estado de la regla:", err);
      toast.show({
        title: "Error al cambiar el estado de la regla",
        description: "Ha ocurrido un error al cambiar el estado de la regla",
        type: "error",
      });
    }
  };

  const handlePreviewRule = async (rule: Partial<ScoringRule>) => {
    try {
      const previewResult = await leadScoringService.previewRuleImpact(rule);
      setPreviewData(previewResult);
      setModalView("preview");
    } catch (err) {
      console.error("Error al generar la vista previa:", err);
      toast.show({
        title: "Error al generar la vista previa",
        description: "Ha ocurrido un error al generar la vista previa",
        type: "error",
      });
    }
  };

  const handleEditRule = (rule: ScoringRule) => {
    console.log("Editando regla (LeadScoringSettings):", rule);

    // Identificar el ID correcto para obtener la regla
    const ruleId = rule.id || rule._id;
    if (!ruleId) {
      console.error("Error: Regla inválida para editar", rule);
      toast.show({
        title: "Error al editar",
        description: "No se puede editar esta regla porque faltan datos",
        type: "error",
      });
      return;
    }

    // Primero obtener la regla completa del servidor
    leadScoringService
      .getRule(ruleId)
      .then((fullRule) => {
        console.log("Regla completa obtenida:", fullRule);
        setSelectedRule(fullRule);
        setModalView("edit");
      })
      .catch((err) => {
        console.error("Error al obtener detalles de la regla:", err);
        toast.show({
          title: "Error al editar",
          description: "No se pudieron cargar los detalles de la regla",
          type: "error",
        });
      });
  };

  const handleViewRule = (rule: ScoringRule) => {
    console.log("Viendo detalles de regla (LeadScoringSettings):", rule);

    // Identificar el ID correcto para obtener la regla
    const ruleId = rule.id || rule._id;
    if (!ruleId) {
      console.error("Error: Regla inválida para ver", rule);
      return;
    }

    leadScoringService
      .getRule(ruleId)
      .then((fullRule) => {
        console.log("Regla completa obtenida para vista:", fullRule);
        setSelectedRule(fullRule);
        setModalView("view");
      })
      .catch((err) => {
        console.error("Error al obtener detalles de la regla para vista:", err);
        toast.show({
          title: "Error",
          description: "No se pudieron cargar los detalles de la regla",
          type: "error",
        });
      });
  };

  const closeModal = () => {
    setModalView(null);
    setSelectedRule(null);
    setPreviewData(null);
  };

  // Prepara la regla para el formulario, normalizando la estructura
  const prepareRuleForForm = (rule: ScoringRule): ScoringRule => {
    // Si la regla tiene rules pero no conditions, usamos rules como conditions
    if (rule.rules && !rule.conditions) {
      return {
        ...rule,
        conditions: rule.rules,
      };
    }
    return rule;
  };

  const renderModalContent = () => {
    switch (modalView) {
      case "create":
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-6">
              Crear nueva regla de puntuación
            </h2>
            <ScoringRuleForm
              onSubmit={handleCreateRule}
              onCancel={closeModal}
              isPreviewAvailable={true}
              onPreview={handlePreviewRule}
            />
          </div>
        );
      case "edit":
        if (!selectedRule) return null;

        const preparedRule = prepareRuleForForm(selectedRule);

        return (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-6">
              Editar regla de puntuación
            </h2>
            <ScoringRuleForm
              initialData={preparedRule}
              onSubmit={handleUpdateRule}
              onCancel={closeModal}
              isPreviewAvailable={true}
              onPreview={handlePreviewRule}
            />
          </div>
        );
      case "view":
        if (!selectedRule) return null;

        const viewRule = prepareRuleForForm(selectedRule);

        return (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Detalles de la regla</h2>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleEditRule(selectedRule)}
                >
                  Editar
                </Button>
                <Button variant="outline" onClick={closeModal}>
                  Cerrar
                </Button>
              </div>
            </div>
            <ScoringRuleDetails
              rule={viewRule}
              stats={{
                contactsAffected: 0, // Estos valores deberían venir de una API
                averagePointsAdded: 0,
                topProperties: [],
              }}
            />
          </div>
        );
      case "preview":
        if (!previewData) return null;
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Vista previa de impacto</h2>
              <Button
                variant="outline"
                onClick={() => setModalView(selectedRule ? "edit" : "create")}
              >
                Volver
              </Button>
            </div>
            <ScorePreview
              data={previewData}
              rule={selectedRule || { name: "Nueva regla" }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Puntuación de Leads (Lead Scoring)
        </h1>
        <Button onClick={() => setModalView("create")}>
          <Plus className="h-5 w-5 mr-2" />
          Nueva regla
        </Button>
      </div>

      <p className="text-gray-600">
        Las reglas de puntuación te permiten asignar automáticamente puntos a
        tus contactos basados en criterios específicos, ayudándote a identificar
        los leads más valiosos.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="text-red-500 mt-0.5 mr-3 h-5 w-5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* {stats && <LeadScoreStats stats={stats} />} */}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <ScoringRulesList
          rules={rules}
          onEdit={handleEditRule}
          onDelete={handleDeleteRule}
          onView={handleViewRule}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {modalView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};
