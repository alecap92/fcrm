import { Link } from "react-router-dom";
import { Zap, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Automation } from "../../services/automationService";
import { AutomationCard } from "./AutomationCard";
import { AUTOMATION_MESSAGES } from "../../constants/automations";

interface AutomationTableProps {
  automations: Automation[];
  loading: boolean;
  hasSearchFilter: boolean;
  onToggleActive: (id: string) => void;
  onExecute: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  getTriggerTypeLabel: (triggerType: string) => string;
}

export function AutomationTable({
  automations,
  loading,
  hasSearchFilter,
  onToggleActive,
  onExecute,
  onDelete,
  getTriggerTypeLabel,
}: AutomationTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action mx-auto"></div>
        <p className="mt-4 text-gray-600">{AUTOMATION_MESSAGES.LOADING}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Automatización
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Disparador
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estadísticas
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 bg-gray-50"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {automations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  {hasSearchFilter ? (
                    <div>
                      <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">
                        {AUTOMATION_MESSAGES.NO_SEARCH_RESULTS}
                      </p>
                      <p className="text-sm">
                        {AUTOMATION_MESSAGES.NO_SEARCH_RESULTS_DESCRIPTION}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">
                        {AUTOMATION_MESSAGES.NO_AUTOMATIONS}
                      </p>
                      <p className="text-sm">
                        {AUTOMATION_MESSAGES.NO_AUTOMATIONS_DESCRIPTION}
                      </p>
                      <Link to="/workflow/new" className="mt-4 inline-block">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Nueva Automatización
                        </Button>
                      </Link>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              automations.map((automation) => (
                <AutomationCard
                  key={automation.id}
                  automation={automation}
                  onToggleActive={onToggleActive}
                  onExecute={onExecute}
                  onDelete={onDelete}
                  getTriggerTypeLabel={getTriggerTypeLabel}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
