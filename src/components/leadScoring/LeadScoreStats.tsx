import React from "react";
import { LeadScoringStats } from "../../types/leadScoring";
import {
  ChartBarIcon,
  RocketLaunchIcon,
  BoltIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

interface LeadScoreStatsProps {
  stats: LeadScoringStats;
}

export const LeadScoreStats: React.FC<LeadScoreStatsProps> = ({ stats }) => {
  const getScoreColor = (range: string): string => {
    const [min] = range.split("-").map(Number);

    if (min >= 80) return "bg-green-500";
    if (min >= 60) return "bg-green-400";
    if (min >= 40) return "bg-yellow-400";
    if (min >= 20) return "bg-orange-400";
    return "bg-red-400";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de reglas</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalRules}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {stats.activeRules} reglas activas (
            {Math.round((stats.activeRules / stats.totalRules) * 100) || 0}%)
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Contactos puntuados</p>
              <h3 className="text-2xl font-bold mt-1">
                {stats.totalContactsScored}
              </h3>
            </div>
            <div className="p-2 bg-green-100 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              Distribución de puntajes
            </p>
          </div>

          <div className="space-y-3">
            {stats.scoreDistribution.map((item) => (
              <div key={item.range} className="flex items-center">
                <span className="text-xs text-gray-600 w-12">{item.range}</span>
                <div className="flex-1 mx-2">
                  <div className="h-5 rounded overflow-hidden bg-gray-100">
                    <div
                      className={`h-full ${getScoreColor(item.range)}`}
                      style={{
                        width: `${
                          (item.count /
                            Math.max(
                              ...stats.scoreDistribution.map((d) => d.count),
                              1
                            )) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 w-10 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
