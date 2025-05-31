import { useState } from "react";
import { Filter, X, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Deal, DealFilter, DealStage } from "../../types/deal";

interface DealFiltersProps {
  onFilterChange: (filters: DealFilter) => void;
  setDeals: (Deals: Deal[]) => void;
  fetchDeals: any;
}

export function DealFilters({
  onFilterChange,
  setDeals,
  fetchDeals,
}: DealFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<DealFilter>({
    search: "",
    stages: [],
    tags: [],
    assignedTo: [],
    probability: [],
    dateRange: { start: "", end: "" },
  });

  const handleFilterChange = (newFilters: Partial<DealFilter>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const activeFiltersCount = Object.values(filters).filter((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  ).length;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isOpen ? "default" : "outline"}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filtros
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 z-50 mt-2 w-96 bg-white border rounded-lg shadow-lg p-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Etapas
                  </label>
                  <button
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => handleFilterChange({ stages: [] })}
                  >
                    Limpiar
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "lead", label: "Lead" },
                    { id: "qualification", label: "Calificación" },
                    { id: "proposal", label: "Propuesta" },
                    { id: "negotiation", label: "Negociación" },
                    { id: "closed_won", label: "Cerrado Ganado" },
                    { id: "closed_lost", label: "Cerrado Perdido" },
                  ].map((stage) => (
                    <label
                      key={stage.id}
                      className="flex items-center p-2 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={filters.stages?.includes(
                          stage.id as DealStage
                        )}
                        onChange={(e) => {
                          const stages = e.target.checked
                            ? [...(filters.stages || []), stage.id as DealStage]
                            : filters.stages?.filter((s) => s !== stage.id);
                          handleFilterChange({ stages });
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {stage.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Probabilidad
                  </label>
                  <button
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => handleFilterChange({ probability: [] })}
                  >
                    Limpiar
                  </button>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 75, label: "75% o más" },
                    { value: 50, label: "50% o más" },
                    { value: 25, label: "25% o más" },
                  ].map((prob) => (
                    <label
                      key={prob.value}
                      className="flex items-center p-2 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={filters.probability?.includes(prob.value)}
                        onChange={(e) => {
                          const probability = e.target.checked
                            ? [...(filters.probability || []), prob.value]
                            : filters.probability?.filter(
                                (p) => p !== prob.value
                              );
                          handleFilterChange({ probability });
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {prob.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Rango de fechas
                  </label>
                  <button
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => handleFilterChange({ dateRange: undefined })}
                  >
                    Limpiar
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Desde
                    </label>
                    <input
                      type="date"
                      className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      value={filters.dateRange?.start}
                      onChange={(e) =>
                        handleFilterChange({
                          dateRange: {
                            ...(filters.dateRange || { end: "" }),
                            start: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Hasta
                    </label>
                    <input
                      type="date"
                      className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      value={filters.dateRange?.end}
                      onChange={(e) =>
                        handleFilterChange({
                          dateRange: {
                            ...(filters.dateRange || { start: "" }),
                            end: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({
                    search: "",
                    stages: [],
                    tags: [],
                    assignedTo: [],
                    probability: [],
                    dateRange: { start: "", end: "" },
                  });
                  onFilterChange({
                    search: "",
                    stages: [],
                    tags: [],
                    assignedTo: [],
                    probability: [],
                    dateRange: { start: "", end: "" },
                  });
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Limpiar todo
              </Button>
              <Button size="sm" onClick={() => setIsOpen(false)}>
                <Check className="w-4 h-4 mr-2" />
                Aplicar
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
