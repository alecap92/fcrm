import { Search, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { FILTER_OPTIONS } from "../../constants/automations";

interface FilterState {
  search: string;
  triggerType: string;
  status: string;
  dateRange: string;
}

interface AutomationFiltersProps {
  filters: FilterState;
  showFilters: boolean;
  onToggleFilters: () => void;
  onUpdateFilter: (key: keyof FilterState, value: string) => void;
}

export function AutomationFilters({
  filters,
  showFilters,
  onToggleFilters,
  onUpdateFilter,
}: AutomationFiltersProps) {
  return (
    <>
      {/* Search and Filters */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar automatizaciones..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
            value={filters.search}
            onChange={(e) => onUpdateFilter("search", e.target.value)}
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={onToggleFilters}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-white rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="rounded-lg border-gray-300"
              value={filters.triggerType}
              onChange={(e) => onUpdateFilter("triggerType", e.target.value)}
            >
              {FILTER_OPTIONS.TRIGGER_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border-gray-300"
              value={filters.status}
              onChange={(e) => onUpdateFilter("status", e.target.value)}
            >
              {FILTER_OPTIONS.STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border-gray-300"
              value={filters.dateRange}
              onChange={(e) => onUpdateFilter("dateRange", e.target.value)}
            >
              {FILTER_OPTIONS.DATE_RANGES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );
}
