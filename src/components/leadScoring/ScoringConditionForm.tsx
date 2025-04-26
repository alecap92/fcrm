import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScoringCondition, ContactProperty } from "../../types/leadScoring";

// Tipos ampliados para las propiedades
export type PropertyOption = {
  value: string;
  label: string;
  category?: "contact" | "deal";
};

export interface ScoringConditionFormProps {
  condition: ScoringCondition;
  contactProperties: PropertyOption[];
  conditionTypes: {
    value: ScoringCondition["condition"];
    label: string;
    category?: "basic" | "deal";
  }[];
  pipelineOptions?: { value: string; label: string }[];
  statusOptions?: { value: string; label: string }[];
  onUpdate: (updates: Partial<ScoringCondition>) => void;
  onRemove: () => void;
}

export const ScoringConditionForm: React.FC<ScoringConditionFormProps> = ({
  condition,
  contactProperties,
  conditionTypes,
  pipelineOptions = [],
  statusOptions = [],
  onUpdate,
  onRemove,
}) => {
  const [showDealFields, setShowDealFields] = useState(false);

  // Determinar si la condición actual es de tipo deal
  useEffect(() => {
    const isDealCondition =
      condition.condition.startsWith("DEAL_") ||
      condition.condition.startsWith("LAST_DEAL_") ||
      condition.condition === "HAS_PURCHASED_PRODUCT" ||
      condition.condition === "PURCHASE_FREQUENCY_LESS_THAN" ||
      condition.condition === "TOTAL_DEALS_COUNT_GREATER_THAN" ||
      condition.condition === "TOTAL_DEALS_AMOUNT_GREATER_THAN";

    setShowDealFields(isDealCondition);
  }, [condition.condition]);

  const needsValueInput = (
    conditionType: ScoringCondition["condition"]
  ): boolean => {
    // Condiciones que NO requieren un valor de entrada
    const noValueNeeded = ["exists"];
    return !noValueNeeded.includes(conditionType);
  };

  const isListInput = (
    conditionType: ScoringCondition["condition"]
  ): boolean => {
    return conditionType === "in_list";
  };

  const isNumberInput = (
    conditionType: ScoringCondition["condition"]
  ): boolean => {
    const numberConditions = [
      "greater_than",
      "less_than",
      "DEAL_AMOUNT_GREATER_THAN",
      "DEAL_AMOUNT_LESS_THAN",
      "LAST_DEAL_OLDER_THAN",
      "LAST_DEAL_NEWER_THAN",
      "TOTAL_DEALS_COUNT_GREATER_THAN",
      "TOTAL_DEALS_AMOUNT_GREATER_THAN",
      "PURCHASE_FREQUENCY_LESS_THAN",
    ];
    return numberConditions.includes(conditionType);
  };

  const isDaysInput = (
    conditionType: ScoringCondition["condition"]
  ): boolean => {
    return (
      conditionType === "LAST_DEAL_OLDER_THAN" ||
      conditionType === "LAST_DEAL_NEWER_THAN" ||
      conditionType === "PURCHASE_FREQUENCY_LESS_THAN"
    );
  };

  const isStatusSelection = (
    conditionType: ScoringCondition["condition"]
  ): boolean => {
    return conditionType === "DEAL_STATUS_IS";
  };

  const isPipelineSelection = (
    conditionType: ScoringCondition["condition"]
  ): boolean => {
    return conditionType === "DEAL_PIPELINE_IS";
  };

  const isProductSelection = (
    conditionType: ScoringCondition["condition"]
  ): boolean => {
    return conditionType === "HAS_PURCHASED_PRODUCT";
  };

  // Filtrar condiciones por categoría
  const getFilteredConditions = () => {
    // Si la propiedad es de tipo deal, mostrar condiciones de deals
    const propertyIsDeal = contactProperties.find(
      (prop) =>
        prop.value === condition.propertyName && prop.category === "deal"
    );

    if (propertyIsDeal) {
      return conditionTypes.filter(
        (type) => type.category === "deal" || type.category === "basic"
      );
    }

    // De lo contrario mostrar solo condiciones básicas
    return conditionTypes.filter((type) => type.category !== "deal");
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Propiedad
          </label>
          <select
            value={condition.propertyName}
            onChange={(e) =>
              onUpdate({
                propertyName: e.target.value,
              })
            }
            className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <optgroup label="Propiedades de contacto">
              {contactProperties
                .filter((prop) => prop.category === "contact" || !prop.category)
                .map((prop) => (
                  <option key={prop.value} value={prop.value}>
                    {prop.label}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Propiedades de negocios">
              {contactProperties
                .filter((prop) => prop.category === "deal")
                .map((prop) => (
                  <option key={prop.value} value={prop.value}>
                    {prop.label}
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condición
          </label>
          <select
            value={condition.condition}
            onChange={(e) => {
              // Verificar que el valor esté en los tipos permitidos
              const selectedValue = e.target
                .value as ScoringCondition["condition"];
              onUpdate({
                condition: selectedValue,
              });
            }}
            className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {getFilteredConditions().map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {needsValueInput(condition.condition) && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isDaysInput(condition.condition)
              ? "Días"
              : isNumberInput(condition.condition)
              ? "Valor numérico"
              : "Valor"}
          </label>

          {isListInput(condition.condition) ? (
            <textarea
              value={
                Array.isArray(condition.value) ? condition.value.join(", ") : ""
              }
              onChange={(e) => {
                const values = e.target.value
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean);
                onUpdate({
                  value: values,
                });
              }}
              placeholder="Ingresa valores separados por comas"
              className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={2}
            />
          ) : isStatusSelection(condition.condition) &&
            statusOptions.length > 0 ? (
            <select
              value={condition.value as string}
              onChange={(e) => onUpdate({ value: e.target.value })}
              className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Seleccionar estado...</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : isPipelineSelection(condition.condition) &&
            pipelineOptions.length > 0 ? (
            <select
              value={condition.value as string}
              onChange={(e) => onUpdate({ value: e.target.value })}
              className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Seleccionar pipeline...</option>
              {pipelineOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : isNumberInput(condition.condition) ? (
            <Input
              type="number"
              value={(condition.value as number) || ""}
              onChange={(e) =>
                onUpdate({
                  value: e.target.value ? parseFloat(e.target.value) : "",
                })
              }
              placeholder={
                isDaysInput(condition.condition) ? "Ej: 30 días" : "Ej: 1000"
              }
            />
          ) : (
            <Input
              type="text"
              value={(condition.value as string) || ""}
              onChange={(e) =>
                onUpdate({
                  value: e.target.value,
                })
              }
              placeholder={
                isProductSelection(condition.condition)
                  ? "Nombre del producto"
                  : "Valor de la condición"
              }
            />
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Puntos
        </label>
        <Input
          type="number"
          value={condition.points.toString()}
          onChange={(e) =>
            onUpdate({
              points: parseInt(e.target.value) || 0,
            })
          }
          min="-100"
          max="100"
        />
      </div>
    </div>
  );
};
