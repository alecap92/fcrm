import React from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScoringCondition, ContactProperty } from "../../types/leadScoring";

export interface ScoringConditionFormProps {
  condition: ScoringCondition;
  contactProperties: { value: ContactProperty; label: string }[];
  conditionTypes: { value: ScoringCondition["condition"]; label: string }[];
  onUpdate: (updates: Partial<ScoringCondition>) => void;
  onRemove: () => void;
}

export const ScoringConditionForm: React.FC<ScoringConditionFormProps> = ({
  condition,
  contactProperties,
  conditionTypes,
  onUpdate,
  onRemove,
}) => {
  const needsValueInput = (
    conditionType: ScoringCondition["condition"]
  ): boolean => {
    return conditionType !== "exists";
  };

  const isListInput = (
    conditionType: ScoringCondition["condition"]
  ): boolean => {
    return conditionType === "in_list";
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
            Campo de contacto
          </label>
          <select
            value={condition.propertyName}
            onChange={(e) =>
              onUpdate({
                propertyName: e.target.value as ContactProperty,
              })
            }
            className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {contactProperties.map((prop) => (
              <option key={prop.value} value={prop.value}>
                {prop.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condición
          </label>
          <select
            value={condition.condition}
            onChange={(e) =>
              onUpdate({
                condition: e.target.value as ScoringCondition["condition"],
              })
            }
            className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {conditionTypes.map((type) => (
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
            Valor
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
          ) : (
            <Input
              type="text"
              value={(condition.value as string) || ""}
              onChange={(e) =>
                onUpdate({
                  value: e.target.value,
                })
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
