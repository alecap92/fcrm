import React, { useState, useEffect } from "react";
import { X, Plus, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import {
  ScoringRule,
  ScoringCondition,
  ContactProperty,
} from "../../types/leadScoring";
import { v4 as uuidv4 } from "uuid";

interface ScoringRuleFormProps {
  initialData?: ScoringRule;
  onSubmit: (
    rule: Omit<ScoringRule, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onCancel: () => void;
  isPreviewAvailable?: boolean;
  onPreview?: (rule: Partial<ScoringRule>) => void;
}

type ConditionType =
  | "exists"
  | "equals"
  | "not_equals"
  | "contains"
  | "greater_than"
  | "less_than"
  | "in_list";

const contactProperties: { value: ContactProperty; label: string }[] = [
  { value: "firstName", label: "Nombre" },
  { value: "lastName", label: "Apellido" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Teléfono" },
  { value: "mobile", label: "Móvil" },
  { value: "companyName", label: "Empresa" },
  { value: "position", label: "Cargo" },
  { value: "address", label: "Dirección" },
  { value: "city", label: "Ciudad" },
  { value: "state", label: "Estado/Provincia" },
  { value: "lifeCycle", label: "Ciclo de vida" },
  { value: "source", label: "Origen" },
];

const conditionTypes: { value: ConditionType; label: string }[] = [
  { value: "exists", label: "Existe" },
  { value: "equals", label: "Igual a" },
  { value: "not_equals", label: "No igual a" },
  { value: "contains", label: "Contiene" },
  { value: "greater_than", label: "Mayor que" },
  { value: "less_than", label: "Menor que" },
  { value: "in_list", label: "En la lista" },
];

const defaultCondition: () => ScoringCondition = () => ({
  id: uuidv4(),
  propertyName: "email",
  condition: "exists",
  points: 5,
});

export const ScoringRuleForm: React.FC<ScoringRuleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isPreviewAvailable = false,
  onPreview,
}) => {
  const [formData, setFormData] = useState<
    Omit<ScoringRule, "id" | "createdAt" | "updatedAt">
  >({
    name: initialData?.name || "",
    description: initialData?.description || "",
    isActive: initialData?.isActive ?? true,
    conditions: initialData?.conditions || [defaultCondition()],
  });

  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    conditions?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      description?: string;
      conditions?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    }

    if (formData.conditions.length === 0) {
      newErrors.conditions = "Debe agregar al menos una condición";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(formData);
    }
  };

  const handleAddCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, defaultCondition()],
    });
  };

  const handleRemoveCondition = (id: string) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((c) => c.id !== id),
    });
  };

  const handleUpdateCondition = (
    id: string,
    updates: Partial<ScoringCondition>
  ) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const needsValueInput = (condition: ConditionType): boolean => {
    return condition !== "exists";
  };

  const isListInput = (condition: ConditionType): boolean => {
    return condition === "in_list";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`mt-1 block w-full rounded-md border ${
              errors.name
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } shadow-sm p-2 focus:outline-none focus:ring-1 sm:text-sm`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Descripción
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className={`mt-1 block w-full rounded-md border ${
              errors.description
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } shadow-sm p-2 focus:outline-none focus:ring-1 sm:text-sm`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              Regla activa
            </span>
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Condiciones</h3>
            <Button
              type="button"
              onClick={handleAddCondition}
              className="inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar condición
            </Button>
          </div>

          {errors.conditions && (
            <div className="mb-4 p-3 bg-red-50 rounded border border-red-200 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
              <p className="text-sm text-red-600">{errors.conditions}</p>
            </div>
          )}

          <div className="space-y-4">
            {formData.conditions.map((condition, index) => (
              <div
                key={condition.id}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveCondition(condition.id)}
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
                        handleUpdateCondition(condition.id, {
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
                        handleUpdateCondition(condition.id, {
                          condition: e.target.value as ConditionType,
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
                          Array.isArray(condition.value)
                            ? condition.value.join(", ")
                            : ""
                        }
                        onChange={(e) => {
                          const values = e.target.value
                            .split(",")
                            .map((v) => v.trim())
                            .filter(Boolean);
                          handleUpdateCondition(condition.id, {
                            value: values,
                          });
                        }}
                        placeholder="Ingresa valores separados por comas"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        rows={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={(condition.value as string) || ""}
                        onChange={(e) =>
                          handleUpdateCondition(condition.id, {
                            value: e.target.value,
                          })
                        }
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puntos
                  </label>
                  <input
                    type="number"
                    value={condition.points}
                    onChange={(e) =>
                      handleUpdateCondition(condition.id, {
                        points: parseInt(e.target.value) || 0,
                      })
                    }
                    className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="-100"
                    max="100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {isPreviewAvailable && (
          <Button type="button" onClick={handlePreview} variant="outline">
            Ver impacto
          </Button>
        )}
        <Button type="button" onClick={onCancel} variant="outline">
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? "Actualizar" : "Crear"} regla
        </Button>
      </div>
    </form>
  );
};
