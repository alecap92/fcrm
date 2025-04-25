import React, { useState } from "react";
import { Edit2, Trash2, Eye, MoreVertical, Zap, ZapOff } from "lucide-react";
import { Button } from "../ui/button";
import { ScoringRule } from "../../types/leadScoring";
import { Badge } from "../ui/badge";
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

  const filteredRules = rules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rule.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                    {rule.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className="text-xs font-medium">
                      {rule.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* {rule.conditions.length} */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(rule.updatedAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleStatus(rule)}
                        title={rule.isActive ? "Desactivar" : "Activar"}
                      >
                        {rule.isActive ? (
                          <ZapOff className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Zap className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(rule)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(rule)}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4 text-amber-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(rule)}
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
