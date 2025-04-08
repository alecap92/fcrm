import { X } from "lucide-react";
import { Button } from "../ui/button";
import type { FilterCondition } from "../../types/contact";

interface ActiveFiltersProps {
  filters: FilterCondition[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  filters,
  onRemove,
  onClearAll,
}: ActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Active filters:</span>
      {filters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-white border shadow-sm"
        >
          <span className="font-medium">{filter.key}</span>
          <span className="text-gray-500">{filter.operator}</span>
          <span>{filter.value}</span>
          <button
            onClick={() => onRemove(filter.id)}
            className="ml-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <Button variant="ghost" size="sm" onClick={onClearAll} className="ml-2">
        Clear all
      </Button>
    </div>
  );
}
