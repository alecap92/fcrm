import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import type { FilterCondition } from "../../types/contact";
import { useAuth } from "../../contexts/AuthContext";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (conditions: FilterCondition[]) => void;
  activeFilters?: FilterCondition[];
}

const operators = {
  text: [
    "contains",
    "equals",
    "starts with",
    "ends with",
    "is empty",
    "is not empty",
  ],
  number: ["equals", "greater than", "less than", "between"],
  date: ["equals", "before", "after", "between", "in the last"],
  list: ["includes", "excludes", "is empty", "is not empty"],
};

function FilterConditionItem({
  condition,
  onUpdate,
  onDelete,
}: {
  condition: FilterCondition;
  onUpdate: (id: string, updates: Partial<FilterCondition>) => void;
  onDelete: (id: string) => void;
}) {
  const state = useAuth();
  const fields = state.organization.contactProperties;
  const field = fields.find((f: any) => f.field === condition.key);
  const fieldType = field?.type || "text";
  const availableOperators = operators[fieldType as keyof typeof operators];

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={condition.key}
          onChange={(e) => onUpdate(condition.id, { key: e.target.value })}
          className="rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
        >
          {fields.map((field: any) => (
            <option key={field.id} value={field.key}>
              {field.label}
            </option>
          ))}
        </select>

        <select
          value={condition.operator}
          onChange={(e) => onUpdate(condition.id, { operator: e.target.value })}
          className="rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
        >
          {availableOperators.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>

        <div className="md:col-span-2">
          {fieldType === "date" && condition.operator === "between" ? (
            <div className="flex gap-2">
              <input
                type="date"
                value={condition.value.split(",")[0] || ""}
                onChange={(e) => {
                  const [, endDate] = condition.value.split(",");
                  onUpdate(condition.id, {
                    value: `${e.target.value},${endDate || ""}`,
                  });
                }}
                className="flex-1 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
              <input
                type="date"
                value={condition.value.split(",")[1] || ""}
                onChange={(e) => {
                  const [startDate] = condition.value.split(",");
                  onUpdate(condition.id, {
                    value: `${startDate || ""},${e.target.value}`,
                  });
                }}
                className="flex-1 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
          ) : (
            <input
              type={fieldType === "number" ? "number" : "text"}
              value={condition.value}
              onChange={(e) =>
                onUpdate(condition.id, { value: e.target.value })
              }
              className="w-full rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              placeholder="Enter value..."
            />
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(condition.id)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

function FiltersModal({
  isOpen,
  onClose,
  onApply,
  activeFilters = [],
}: FilterModalProps) {
  const [conditions, setConditions] =
    useState<FilterCondition[]>(activeFilters);

  const handleAddCondition = () => {
    const newCondition: FilterCondition = {
      id: `condition_${Date.now()}`,
      key: "Apellido",
      operator: "contains",
      value: "",
    };
    setConditions([...conditions, newCondition]);
  };

  const handleUpdateCondition = (
    id: string,
    updates: Partial<FilterCondition>
  ) => {
    setConditions((current) =>
      current.map((condition) =>
        condition.id === id ? { ...condition, ...updates } : condition
      )
    );
  };

  const handleDeleteCondition = (id: string) => {
    setConditions((current) =>
      current.filter((condition) => condition.id !== id)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Filter Contacts
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <Button onClick={handleAddCondition} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Condition
            </Button>
          </div>

          <div className="space-y-4">
            {conditions.map((condition) => (
              <FilterConditionItem
                key={condition.id}
                condition={condition}
                onUpdate={handleUpdateCondition}
                onDelete={handleDeleteCondition}
              />
            ))}

            {conditions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No filter conditions added yet. Click "Add Condition" to start
                filtering.
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onApply(conditions);
              onClose();
            }}
            disabled={conditions.length === 0}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FiltersModal;
