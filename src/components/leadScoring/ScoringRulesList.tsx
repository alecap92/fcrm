import React, { useState } from "react";
import { Edit2, Trash2, Eye, Zap, ZapOff } from "lucide-react";
import { Button } from "../ui/button";
import { ScoringRule } from "../../types/leadScoring";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ScoringRulesListProps {
  rules: ScoringRule[];
  onEdit: (rule: ScoringRule) => void;
  onDelete: (rule: ScoringRule) => void;
  onView: (rule: ScoringRule) => void;
  onToggleStatus: (rule: ScoringRule) => void;
}

export const ScoringRulesList: React.FC<ScoringRulesListProps> = ({
  rules,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRules = rules?.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (rule: ScoringRule) => {
    console.log("Clic en editar regla (ScoringRulesList):", rule);
    if (!rule || (!rule.id && !rule._id)) {
      console.error(
        "Error: Regla inválida para editar en ScoringRulesList",
        rule
      );
      return;
    }

    try {
      onEdit(rule);
    } catch (error) {
      console.error("Error al llamar a onEdit:", error);
    }
  };

  const handleViewClick = (rule: ScoringRule) => {
    console.log("Clic en ver regla (ScoringRulesList):", rule);
    if (!rule || (!rule.id && !rule._id)) {
      console.error("Error: Regla inválida para ver en ScoringRulesList", rule);
      return;
    }

    try {
      onView(rule);
    } catch (error) {
      console.error("Error al llamar a onView:", error);
    }
  };

  const handleDeleteClick = (rule: ScoringRule) => {
    console.log("Clic en eliminar regla:", rule);
    onDelete(rule);
  };

  const handleToggleClick = (rule: ScoringRule) => {
    console.log("Clic en cambiar estado de regla:", rule);
    onToggleStatus(rule);
  };

  // Función para obtener el número de condiciones
  const getConditionsCount = (rule: ScoringRule): number => {
    if (rule.conditions && rule.conditions.length > 0) {
      return rule.conditions.length;
    } else if (rule.rules && rule.rules.length > 0) {
      return rule.rules.length;
    }
    return 0;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar reglas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Condiciones
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última actualización
              </th>
              <th className="px-6 py-3 bg-gray-50"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRules.length > 0 ? (
              filteredRules.map((rule) => (
                <tr
                  key={rule.id || rule._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewClick(rule)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rule.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                    {rule.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        rule.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {rule.isActive ? "Activa" : "Inactiva"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getConditionsCount(rule)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.updatedAt &&
                      formatDistanceToNow(new Date(rule.updatedAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewClick(rule);
                        }}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(rule);
                        }}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4 text-amber-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(rule);
                        }}
                        title="Eliminar"
                        className="hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  {searchTerm
                    ? "No se encontraron reglas con ese término de búsqueda"
                    : "No hay reglas de puntuación definidas"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
