import React from "react";
import { ScoringRule } from "../../types/leadScoring";

interface ScorePreviewProps {
  data: {
    affectedContacts: number;
    examples: {
      contactId: string;
      name: string;
      currentScore: number;
      newScore: number;
    }[];
  };
  rule: Partial<ScoringRule>;
}

export const ScorePreview: React.FC<ScorePreviewProps> = ({ data, rule }) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-3">
          Vista previa de impacto para:{" "}
          <span className="text-blue-900">{rule.name}</span>
        </h3>

        <div className="text-sm text-blue-800 mb-4">
          Esta regla afectará a{" "}
          <span className="font-bold">{data.affectedContacts}</span> contactos
          si se aplica.
        </div>

        <div className="bg-white rounded-lg border border-blue-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  Contacto
                </th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  Puntuación actual
                </th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  Nueva puntuación
                </th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  Cambio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.examples.map((example) => {
                const scoreDiff = example.newScore - example.currentScore;

                return (
                  <tr key={example.contactId}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {example.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {example.currentScore}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      {example.newScore}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          scoreDiff > 0
                            ? "bg-green-100 text-green-800"
                            : scoreDiff < 0
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {scoreDiff > 0 && "+"}
                        {scoreDiff}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {data.examples.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-3 text-center text-sm text-gray-500"
                  >
                    No hay ejemplos disponibles para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Nota: Esta es solo una vista previa. Los cambios no se aplicarán hasta
        que guardes la regla.
      </div>
    </div>
  );
};
