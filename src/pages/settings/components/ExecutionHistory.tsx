import React, { useState, useEffect } from "react";
import {
  History,
  Clock,
  Check,
  X,
  AlertTriangle,
  Eye,
  Download,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { useToast } from "../../../components/ui/toast";

interface ExecutionLog {
  _id: string;
  automationId: string;
  automationName: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  executionDetails: {
    startTime: string;
    endTime?: string;
    duration?: number;
    attempts: number;
    maxAttempts: number;
  };
  inputData: {
    trigger: string;
    context: any;
  };
  result: {
    success: boolean;
    response?: any;
    error?: {
      message: string;
      code?: string;
    };
    webhookResponses: Array<{
      webhookName: string;
      status: number;
      duration: number;
      success: boolean;
    }>;
  };
  createdAt: string;
}

export function ExecutionHistory() {
  const [executions, setExecutions] = useState<ExecutionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedExecution, setSelectedExecution] =
    useState<ExecutionLog | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const toast = useToast();

  useEffect(() => {
    loadExecutions();
  }, [page, statusFilter]);

  const loadExecutions = async () => {
    try {
      setIsLoading(true);
      // TODO: Implementar llamada a la API
      // const response = await n8nService.getExecutionHistory({
      //   page,
      //   status: statusFilter !== "all" ? statusFilter : undefined,
      //   search: searchTerm || undefined
      // });

      // Datos de ejemplo por ahora
      const mockExecutions: ExecutionLog[] = [
        {
          _id: "1",
          automationId: "auto1",
          automationName: "Crear Contacto",
          status: "completed",
          executionDetails: {
            startTime: "2024-01-15T10:30:00Z",
            endTime: "2024-01-15T10:30:02Z",
            duration: 2000,
            attempts: 1,
            maxAttempts: 3,
          },
          inputData: {
            trigger: "manual_execution",
            context: { conversationId: "conv1" },
          },
          result: {
            success: true,
            response: { message: "Contacto creado exitosamente" },
            webhookResponses: [
              {
                webhookName: "Webhook Principal",
                status: 200,
                duration: 1500,
                success: true,
              },
            ],
          },
          createdAt: "2024-01-15T10:30:00Z",
        },
        {
          _id: "2",
          automationId: "auto2",
          automationName: "Seguimiento de Lead",
          status: "failed",
          executionDetails: {
            startTime: "2024-01-15T09:15:00Z",
            endTime: "2024-01-15T09:15:05Z",
            duration: 5000,
            attempts: 2,
            maxAttempts: 3,
          },
          inputData: {
            trigger: "scheduled",
            context: { leadId: "lead1" },
          },
          result: {
            success: false,
            error: {
              message: "Webhook no respondió",
              code: "TIMEOUT",
            },
            webhookResponses: [
              {
                webhookName: "Email Reminder",
                status: 0,
                duration: 5000,
                success: false,
              },
            ],
          },
          createdAt: "2024-01-15T09:15:00Z",
        },
      ];

      if (page === 1) {
        setExecutions(mockExecutions);
      } else {
        setExecutions((prev) => [...prev, ...mockExecutions]);
      }

      setHasMore(mockExecutions.length > 0);
    } catch (error) {
      console.error("Error cargando historial:", error);
      toast.show({
        title: "Error",
        description: "No se pudo cargar el historial",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadExecutions();
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-600" />;
      case "failed":
        return <X className="w-4 h-4 text-red-600" />;
      case "running":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "failed":
        return "Falló";
      case "running":
        return "Ejecutándose";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const downloadExecutionLog = (execution: ExecutionLog) => {
    const data = {
      executionLog: execution,
      downloadedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `execution-log-${execution._id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.show({
      title: "Descargado",
      description: "Log de ejecución descargado",
      type: "success",
    });
  };

  const filteredExecutions = executions.filter((execution) => {
    const matchesSearch =
      execution.automationName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      execution.inputData.trigger
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || execution.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-6 h-6" />
            Historial de Ejecuciones
          </h2>
          <p className="text-gray-600">
            Revisa el historial completo de todas las ejecuciones de
            automatizaciones
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Buscar por automatización o trigger..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completados</option>
              <option value="failed">Fallidos</option>
              <option value="running">Ejecutándose</option>
              <option value="pending">Pendientes</option>
            </select>

            <Button onClick={handleSearch}>Buscar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ejecuciones */}
      <div className="space-y-4">
        {filteredExecutions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay ejecuciones
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "No se encontraron ejecuciones con los filtros aplicados"
                    : "Las ejecuciones aparecerán aquí una vez que se ejecuten las automatizaciones"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredExecutions.map((execution) => (
            <Card
              key={execution._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(execution.status)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {execution.automationName}
                      </h3>
                      <Badge className={getStatusColor(execution.status)}>
                        {getStatusLabel(execution.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>Trigger: {execution.inputData.trigger}</span>
                      <span>
                        Duración:{" "}
                        {formatDuration(
                          execution.executionDetails.duration || 0
                        )}
                      </span>
                      <span>
                        Intentos: {execution.executionDetails.attempts}/
                        {execution.executionDetails.maxAttempts}
                      </span>
                      <span>
                        Webhooks: {execution.result.webhookResponses.length}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>
                        Iniciado:{" "}
                        {new Date(
                          execution.executionDetails.startTime
                        ).toLocaleString()}
                      </p>
                      {execution.executionDetails.endTime && (
                        <p>
                          Finalizado:{" "}
                          {new Date(
                            execution.executionDetails.endTime
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Resumen de Webhooks */}
                    {execution.result.webhookResponses.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {execution.result.webhookResponses.map(
                          (webhook, index) => (
                            <Badge
                              key={index}
                              variant={
                                webhook.success ? "default" : "destructive"
                              }
                              className="text-xs"
                            >
                              {webhook.webhookName}: {webhook.status} (
                              {formatDuration(webhook.duration)})
                            </Badge>
                          )
                        )}
                      </div>
                    )}

                    {/* Error si falló */}
                    {execution.status === "failed" &&
                      execution.result.error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Error:</strong>{" "}
                            {execution.result.error.message}
                            {execution.result.error.code &&
                              ` (${execution.result.error.code})`}
                          </p>
                        </div>
                      )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedExecution(execution)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadExecutionLog(execution)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Botón Cargar Más */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Cargando..." : "Cargar Más"}
          </Button>
        </div>
      )}

      {/* Modal de Detalles */}
      {selectedExecution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">Detalles de Ejecución</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedExecution(null)}
              >
                Cerrar
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Información General */}
                <div>
                  <h4 className="font-medium mb-3">Información General</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>
                        <strong>Automatización:</strong>{" "}
                        {selectedExecution.automationName}
                      </p>
                      <p>
                        <strong>Estado:</strong>{" "}
                        {getStatusLabel(selectedExecution.status)}
                      </p>
                      <p>
                        <strong>Trigger:</strong>{" "}
                        {selectedExecution.inputData.trigger}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Iniciado:</strong>{" "}
                        {new Date(
                          selectedExecution.executionDetails.startTime
                        ).toLocaleString()}
                      </p>
                      <p>
                        <strong>Duración:</strong>{" "}
                        {formatDuration(
                          selectedExecution.executionDetails.duration || 0
                        )}
                      </p>
                      <p>
                        <strong>Intentos:</strong>{" "}
                        {selectedExecution.executionDetails.attempts}/
                        {selectedExecution.executionDetails.maxAttempts}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Respuestas de Webhooks */}
                <div>
                  <h4 className="font-medium mb-3">Respuestas de Webhooks</h4>
                  <div className="space-y-3">
                    {selectedExecution.result.webhookResponses.map(
                      (webhook, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {webhook.webhookName}
                            </span>
                            <Badge
                              variant={
                                webhook.success ? "default" : "destructive"
                              }
                            >
                              {webhook.success ? "Éxito" : "Error"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Status: {webhook.status}</p>
                            <p>Duración: {formatDuration(webhook.duration)}</p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Datos de Entrada */}
                <div>
                  <h4 className="font-medium mb-3">Datos de Entrada</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(selectedExecution.inputData, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Resultado */}
                <div>
                  <h4 className="font-medium mb-3">Resultado</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(selectedExecution.result, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
