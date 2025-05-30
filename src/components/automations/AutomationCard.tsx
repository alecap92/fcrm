import { Link } from "react-router-dom";
import { Zap, Play, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Automation } from "../../services/automationService";

interface AutomationCardProps {
  automation: Automation;
  onToggleActive: (id: string) => void;
  onExecute: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  getTriggerTypeLabel: (triggerType: string) => string;
}

export function AutomationCard({
  automation,
  onToggleActive,
  onExecute,
  onDelete,
  getTriggerTypeLabel,
}: AutomationCardProps) {
  return (
    <tr key={automation.id} className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-action/10">
            <Zap className="w-5 h-5 text-action" />
          </div>
          <div className="ml-4">
            <Link
              to={`/workflow/${automation.id}`}
              className="text-sm font-medium text-gray-900 hover:text-action"
            >
              {automation.name}
            </Link>
            {automation.description && (
              <div className="text-sm text-gray-500 mt-1">
                {automation.description}
              </div>
            )}
            <div className="text-xs text-gray-400 mt-1">
              Creado {new Date(automation.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {getTriggerTypeLabel(automation.triggerType || "manual")}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div>
          <div>Total: {automation.stats?.totalExecutions || 0}</div>
          <div className="text-xs">
            Exitosas: {automation.stats?.successfulExecutions || 0} | Fallidas:{" "}
            {automation.stats?.failedExecutions || 0}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <Switch
          checked={automation.isActive}
          onCheckedChange={() => onToggleActive(automation.id)}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onExecute(automation.id)}
            disabled={!automation.isActive}
            title="Ejecutar manualmente"
          >
            <Play className="w-4 h-4" />
          </Button>
          <Link to={`/workflow/${automation.id}`}>
            <Button variant="ghost" size="sm" title="Editar">
              <Edit2 className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(automation.id, automation.name)}
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
