import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import {
  ScoringRule,
  ScoringCondition,
  ContactProperty,
  DealProperty,
} from "../../types/leadScoring";
import { ScoringConditionForm } from "./ScoringConditionForm";
import { useAuth } from "../../contexts/AuthContext";
import { dealsService } from "../../services/dealsService";

// Lista de tipos de condiciones básicas
const basicConditionTypes: {
  value: ScoringCondition["condition"];
  label: string;
  category: "basic";
}[] = [
  { value: "exists", label: "Existe", category: "basic" },
  { value: "equals", label: "Igual a", category: "basic" },
  { value: "not_equals", label: "No igual a", category: "basic" },
  { value: "contains", label: "Contiene", category: "basic" },
  { value: "greater_than", label: "Mayor que", category: "basic" },
  { value: "less_than", label: "Menor que", category: "basic" },
  { value: "in_list", label: "En la lista", category: "basic" },
];

// Lista de tipos de condiciones relacionadas con deals
const dealConditionTypes: {
  value: ScoringCondition["condition"];
  label: string;
  category: "deal";
}[] = [
  {
    value: "LAST_DEAL_OLDER_THAN",
    label: "Último negocio más antiguo que X días",
    category: "deal",
  },
  {
    value: "LAST_DEAL_NEWER_THAN",
    label: "Último negocio más reciente que X días",
    category: "deal",
  },
  {
    value: "DEAL_AMOUNT_GREATER_THAN",
    label: "Monto del negocio mayor que",
    category: "deal",
  },
  {
    value: "DEAL_AMOUNT_LESS_THAN",
    label: "Monto del negocio menor que",
    category: "deal",
  },
  { value: "DEAL_STATUS_IS", label: "Estado del negocio es", category: "deal" },
  {
    value: "DEAL_PIPELINE_IS",
    label: "Pipeline del negocio es",
    category: "deal",
  },
  {
    value: "TOTAL_DEALS_COUNT_GREATER_THAN",
    label: "Cantidad de negocios mayor que",
    category: "deal",
  },
  {
    value: "TOTAL_DEALS_AMOUNT_GREATER_THAN",
    label: "Valor total de negocios mayor que",
    category: "deal",
  },
  {
    value: "HAS_PURCHASED_PRODUCT",
    label: "Ha comprado el producto",
    category: "deal",
  },
  {
    value: "PURCHASE_FREQUENCY_LESS_THAN",
    label: "Frecuencia de compra menor que X días",
    category: "deal",
  },
  {
    value: "DEAL_FIELD_VALUE_IS",
    label: "Campo personalizado del negocio es",
    category: "deal",
  },
];

// Combinar todos los tipos de condiciones
const conditionTypes = [...basicConditionTypes, ...dealConditionTypes];

// Propiedades de deals predeterminadas
const dealProperties: { value: string; label: string }[] = [
  { value: "title", label: "Título del negocio" },
  { value: "amount", label: "Monto" },
  { value: "closingDate", label: "Fecha de cierre" },
  { value: "status", label: "Estado" },
  { value: "pipeline", label: "Pipeline" },
  { value: "associatedContactId", label: "Contacto asociado" },
  { value: "associatedCompanyId", label: "Empresa asociada" },
  { value: "lastActivityDate", label: "Fecha de última actividad" },
  { value: "productsPurchased", label: "Productos adquiridos" },
];

interface ScoringRuleFormProps {
  initialData?: ScoringRule;
  onSubmit: (
    rule: Omit<ScoringRule, "id" | "_id" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
  isPreviewAvailable?: boolean;
  onPreview?: (rule: Partial<ScoringRule>) => void;
}

export const ScoringRuleForm: React.FC<ScoringRuleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isPreviewAvailable = false,
  onPreview,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [conditions, setConditions] = useState<ScoringCondition[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { organization } = useAuth();
  const [pipelineOptions, setPipelineOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [statusOptions, setStatusOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Propiedades de contacto desde la organización
  const contactProperties = organization?.contactProperties?.map((prop) => ({
    value: prop.key as ContactProperty,
    label: prop.label || prop.key,
    category: "contact" as const,
  })) || [
    // Propiedades predeterminadas como fallback
    { value: "email", label: "Email", category: "contact" as const },
    { value: "firstName", label: "Nombre", category: "contact" as const },
    { value: "lastName", label: "Apellido", category: "contact" as const },
    { value: "phone", label: "Teléfono", category: "contact" as const },
  ];

  // Combinar propiedades de contacto y deals
  const allProperties = [
    ...contactProperties,
    ...dealProperties.map((prop) => ({ ...prop, category: "deal" as const })),
  ];

  // Cargar pipelines y estados desde dealsService
  useEffect(() => {
    const fetchDealOptions = async () => {
      try {
        // Obtener pipelines
        const pipelinesResponse = await dealsService.getPipelines();
        if (pipelinesResponse && pipelinesResponse.data) {
          const formattedPipelines = pipelinesResponse.data.map(
            (pipeline: any) => ({
              value: pipeline.id || pipeline._id,
              label: pipeline.name,
            })
          );
          setPipelineOptions(formattedPipelines);

          // Si hay pipelines, obtener estados del primer pipeline
          if (formattedPipelines.length > 0) {
            const firstPipelineId = formattedPipelines[0].value;
            const statusesResponse = await dealsService.getStatuses(
              firstPipelineId
            );
            if (statusesResponse && statusesResponse.data) {
              const formattedStatuses = statusesResponse.data.map(
                (column: any) => ({
                  value: column.id || column._id,
                  label: column.name,
                })
              );
              setStatusOptions(formattedStatuses);
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar opciones de deals:", error);
      }
    };

    fetchDealOptions();
  }, []);

  // Inicializar el formulario con los datos existentes si se están editando
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setIsActive(
        initialData.isActive !== undefined ? initialData.isActive : true
      );

      // Usar conditions si existen, de lo contrario usar rules si existen
      if (initialData.conditions && initialData.conditions.length > 0) {
        setConditions(initialData.conditions);
      } else if (initialData.rules && initialData.rules.length > 0) {
        setConditions(initialData.rules);
      } else {
        setConditions([]);
      }
    }
  }, [initialData]);

  const handleAddCondition = () => {
    // Usar la primera propiedad disponible como valor predeterminado
    const defaultProperty =
      contactProperties.length > 0 ? contactProperties[0].value : "email";

    const newCondition: ScoringCondition = {
      propertyName: defaultProperty,
      condition: "exists",
      points: 5,
    };
    setConditions([...conditions, newCondition]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleUpdateCondition = (
    index: number,
    updates: Partial<ScoringCondition>
  ) => {
    const updatedConditions = [...conditions];
    updatedConditions[index] = { ...updatedConditions[index], ...updates };
    setConditions(updatedConditions);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    }

    if (conditions.length === 0) {
      newErrors.conditions = "Debe agregar al menos una condición";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const ruleData: Omit<
      ScoringRule,
      "id" | "_id" | "createdAt" | "updatedAt"
    > = {
      name,
      description,
      isActive,
      conditions,
      // En el servidor se espera 'rules' en lugar de 'conditions'
      rules: conditions,
    };

    onSubmit(ruleData);
  };

  const handlePreview = () => {
    if (onPreview && validateForm()) {
      const previewData: Partial<ScoringRule> = {
        name,
        description,
        isActive,
        conditions,
        rules: conditions, // Incluir ambos para compatibilidad
      };
      onPreview(previewData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Clientes potenciales de alto valor"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el propósito de esta regla..."
            rows={3}
            className={`mt-1 block w-full rounded-md border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } shadow-sm p-2 focus:outline-none focus:ring-1 sm:text-sm`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <span className="ml-3 text-sm font-medium text-gray-700">
              Regla activa
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Condiciones</h3>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddCondition}
            className="inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar condición
          </Button>
        </div>

        {errors.conditions && (
          <p className="text-red-500 text-sm">{errors.conditions}</p>
        )}

        {conditions.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>
              No hay condiciones. Agrega una condición para definir cuándo se
              deben asignar puntos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conditions.map((condition, index) => (
              <ScoringConditionForm
                key={index}
                condition={condition}
                contactProperties={allProperties}
                conditionTypes={conditionTypes}
                pipelineOptions={pipelineOptions}
                statusOptions={statusOptions}
                onUpdate={(updates) => handleUpdateCondition(index, updates)}
                onRemove={() => handleRemoveCondition(index)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? "Actualizar regla" : "Crear regla"}
        </Button>
      </div>
    </form>
  );
};
