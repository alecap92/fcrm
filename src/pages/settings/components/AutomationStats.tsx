import React from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

export function AutomationStats() {
  // Datos de ejemplo - en producción vendrían de la API
  const stats = {
    totalExecutions: 156,
    successfulExecutions: 142,
    failedExecutions: 14,
    avgExecutionTime: 1250,
    successRate: 91.0,
    totalAutomations: 12,
    activeAutomations: 8,
    recentActivity: [
      { date: "2024-01-15", executions: 23, success: 21 },
      { date: "2024-01-14", executions: 18, success: 17 },
      { date: "2024-01-13", executions: 25, success: 24 },
      { date: "2024-01-12", executions: 20, success: 18 },
      { date: "2024-01-11", executions: 22, success: 20 },
      { date: "2024-01-10", executions: 19, success: 18 },
      { date: "2024-01-09", executions: 29, success: 26 },
    ],
  };

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Ejecuciones
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExecutions}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.successRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.successfulExecutions} de {stats.totalExecutions}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Promedio
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(stats.avgExecutionTime)}
            </div>
            <p className="text-xs text-muted-foreground">Por ejecución</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Automatizaciones
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAutomations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeAutomations} de {stats.totalAutomations} activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente (7 días)</CardTitle>
          <CardDescription>
            Número de ejecuciones por día y tasa de éxito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {stats.recentActivity.map((day, index) => {
              const successRate = (day.success / day.executions) * 100;
              const maxHeight = 200; // altura máxima del gráfico
              const barHeight =
                (day.executions /
                  Math.max(...stats.recentActivity.map((d) => d.executions))) *
                maxHeight;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  {/* Barra de ejecuciones totales */}
                  <div
                    className="w-full bg-gray-200 rounded-t"
                    style={{ height: `${barHeight}px` }}
                  >
                    {/* Porción de éxito */}
                    <div
                      className="bg-green-500 rounded-t transition-all duration-300"
                      style={{
                        height: `${(day.success / day.executions) * 100}%`,
                        minHeight: "4px",
                      }}
                    />
                  </div>

                  {/* Etiqueta del día */}
                  <div className="text-xs text-gray-600 mt-2 text-center">
                    {formatDate(day.date)}
                  </div>

                  {/* Número de ejecuciones */}
                  <div className="text-xs font-medium mt-1">
                    {day.executions}
                  </div>

                  {/* Tasa de éxito */}
                  <div className="text-xs text-gray-500">
                    {successRate.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Rendimiento</CardTitle>
            <CardDescription>
              Métricas clave del sistema de automatizaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Ejecuciones Exitosas
              </span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium">
                  {stats.successfulExecutions}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Ejecuciones Fallidas
              </span>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="font-medium">{stats.failedExecutions}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tiempo Promedio</span>
              <span className="font-medium">
                {formatDuration(stats.avgExecutionTime)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Automatizaciones Activas
              </span>
              <span className="font-medium">
                {stats.activeAutomations}/{stats.totalAutomations}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>
              Desglose de las ejecuciones por estado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Estado: Completado */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Completado</span>
                  <span className="text-sm text-gray-600">
                    {stats.successfulExecutions}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (stats.successfulExecutions / stats.totalExecutions) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Estado: Fallido */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Fallido</span>
                  <span className="text-sm text-gray-600">
                    {stats.failedExecutions}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (stats.failedExecutions / stats.totalExecutions) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Estado: En Proceso (estimado) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">En Proceso</span>
                  <span className="text-sm text-gray-600">0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones</CardTitle>
          <CardDescription>
            Sugerencias para mejorar el rendimiento del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.successRate < 95 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Tasa de éxito por debajo del 95%
                  </p>
                  <p className="text-sm text-yellow-700">
                    Revisa las automatizaciones que están fallando y optimiza
                    los webhooks.
                  </p>
                </div>
              </div>
            )}

            {stats.avgExecutionTime > 2000 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Tiempo de ejecución alto
                  </p>
                  <p className="text-sm text-blue-700">
                    Considera optimizar los webhooks o aumentar los timeouts
                    para mejorar la experiencia del usuario.
                  </p>
                </div>
              </div>
            )}

            {stats.activeAutomations < stats.totalAutomations * 0.8 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Buen rendimiento general
                  </p>
                  <p className="text-sm text-green-700">
                    El sistema está funcionando bien. Considera agregar más
                    automatizaciones para aumentar la eficiencia.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
