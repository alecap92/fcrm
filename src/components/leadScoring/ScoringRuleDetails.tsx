import React from "react";
import { ScoringRule } from "../../types/leadScoring";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ScoringRuleDetailsProps {
  rule: ScoringRule;
  stats?: {
    contactsAffected: number;
    averagePointsAdded: number;
    topProperties: { property: string; count: number }[];
  };
}

const getConditionLabel = (condition: string): string => {
  const conditionMap: Record<string, string> = {
    exists: "Existe",
    equals: "Igual a",
    not_equals: "No igual a",
    contains: "Contiene",
    greater_than: "Mayor que",
    less_than: "Menor que",
    in_list: "En la lista",
  };

  return conditionMap[condition] || condition;
};

const getPropertyLabel = (property: string): string => {
  const propertyMap: Record<string, string> = {
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Email",
    phone: "Teléfono",
    mobile: "Móvil",
    companyName: "Empresa",
    position: "Cargo",
    address: "Dirección",
    city: "Ciudad",
    state: "Estado/Provincia",
    lifeCycle: "Ciclo de vida",
    source: "Origen",
  };

  return propertyMap[property] || property;
};

export const ScoringRuleDetails: React.FC<ScoringRuleDetailsProps> = ({
  rule,
  stats,
}) => {
  const formatValue = (
    value: string | number | string[] | undefined
  ): string => {
    if (value === undefined) return "-";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{rule.name}</h2>
          <p className="mt-1 text-sm text-gray-500">{rule.description}</p>
        </div>
        <Badge
          variant={rule.isActive ? "success" : "secondary"}
          className="text-xs font-medium"
        >
          {rule.isActive ? "Activa" : "Inactiva"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Fecha de creación:</span>{" "}
          <span className="font-medium">
            {format(new Date(rule.createdAt), "PPP", { locale: es })}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Última actualización:</span>{" "}
          <span className="font-medium">
            {format(new Date(rule.updatedAt), "PPP", { locale: es })}
          </span>
        </div>
      </div>

      {stats && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">
            Estadísticas de impacto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="text-xs text-gray-500 mb-1">
                Contactos afectados
              </div>
              <div className="text-xl font-bold">{stats.contactsAffected}</div>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Puntos promedio</div>
              <div className="text-xl font-bold">
                {stats.averagePointsAdded}
              </div>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="text-xs text-gray-500 mb-1">
                Campos más frecuentes
              </div>
              <div className="text-sm font-medium">
                {stats.topProperties.length > 0
                  ? stats.topProperties[0].property
                  : "Ninguno"}
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Condiciones</h3>
        <div className="space-y-3">
          {rule.conditions.map((condition) => (
            <div
              key={condition.id}
              className="bg-gray-50 p-3 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-gray-700">
                    {getPropertyLabel(condition.propertyName)}
                  </span>
                  <span className="text-gray-500">
                    {getConditionLabel(condition.condition)}
                  </span>
                  {condition.condition !== "exists" && (
                    <span className="font-medium">
                      {formatValue(condition.value)}
                    </span>
                  )}
                </div>
                <Badge
                  variant={condition.points >= 0 ? "success" : "danger"}
                  className="text-xs"
                >
                  {condition.points > 0 ? "+" : ""}
                  {condition.points} puntos
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
