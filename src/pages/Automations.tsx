import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link, useLocation } from "react-router-dom";
import {
  AutomationFilters,
  AutomationTable,
  DeleteDialog,
} from "../components/automations";
import { useAutomations } from "../hooks/useAutomations";
import { AUTOMATION_TABS, TRIGGER_TYPE_LABELS } from "../constants/automations";

// ===== INTERFACES =====
interface DeleteDialogState {
  isOpen: boolean;
  automationId: string;
  automationName: string;
}

interface FilterState {
  search: string;
  triggerType: string;
  status: string;
  dateRange: string;
}

// ===== COMPONENTE PRINCIPAL =====
export function Automations() {
  const location = useLocation();
  const {
    automations,
    loading,
    fetchAutomations,
    toggleAutomationActive,
    deleteAutomation,
    executeAutomation,
  } = useAutomations();

  // ===== ESTADO LOCAL =====
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    triggerType: "",
    status: "",
    dateRange: "",
  });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    automationId: "",
    automationName: "",
  });

  // ===== FUNCIONES DE UI =====
  const getTriggerTypeLabel = useCallback((triggerType: string) => {
    return TRIGGER_TYPE_LABELS[triggerType] || triggerType;
  }, []);

  const openDeleteDialog = useCallback(
    (automationId: string, automationName: string) => {
      setDeleteDialog({
        isOpen: true,
        automationId,
        automationName,
      });
    },
    []
  );

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({
      isOpen: false,
      automationId: "",
      automationName: "",
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.automationId) return;

    await deleteAutomation(deleteDialog.automationId);
    closeDeleteDialog();
  }, [deleteDialog.automationId, deleteAutomation, closeDeleteDialog]);

  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ===== DATOS FILTRADOS =====
  const filteredAutomations = automations.filter((automation) => {
    const matchesSearch = automation.name
      .toLowerCase()
      .includes(filters.search.toLowerCase());
    const matchesTriggerType =
      !filters.triggerType || automation.triggerType === filters.triggerType;
    const matchesStatus =
      !filters.status ||
      filters.status === "all" ||
      automation.status === filters.status;

    return matchesSearch && matchesTriggerType && matchesStatus;
  });

  // ===== EFECTOS =====
  useEffect(() => {
    fetchAutomations({
      search: filters.search || undefined,
      status: filters.status === "all" ? undefined : (filters.status as any),
    });
  }, [fetchAutomations, filters.search, filters.status]);

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Automatizaciones
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona tus flujos de trabajo automatizados para WhatsApp
              </p>
            </div>
            <Link to="/workflow/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Automatización
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b">
            <nav className="-mb-px flex space-x-8">
              {AUTOMATION_TABS.map((tab) => {
                const isActive = location.pathname === tab.href;
                return (
                  <Link
                    key={tab.id}
                    to={tab.href}
                    className={`
                      whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                      ${
                        isActive
                          ? "border-action text-action"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }
                    `}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Filters */}
          <AutomationFilters
            filters={filters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onUpdateFilter={updateFilter}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <AutomationTable
          automations={filteredAutomations}
          loading={loading}
          hasSearchFilter={!!filters.search}
          onToggleActive={toggleAutomationActive}
          onExecute={executeAutomation}
          onDelete={openDeleteDialog}
          getTriggerTypeLabel={getTriggerTypeLabel}
        />
      </div>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        automationName={deleteDialog.automationName}
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
