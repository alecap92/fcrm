import { useEffect, useState } from "react";
import { X, AlertCircle, CheckCircle, Clock, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../ui/button";
import {
  executionService,
  ExecutionLog,
} from "../../services/executionService";
import { Badge } from "../ui/badge";

interface ExecutionHistoryModalProps {
  automationId: string;
  onClose: () => void;
}

export function ExecutionHistoryModal({
  automationId,
  onClose,
}: ExecutionHistoryModalProps) {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const logsPerPage = 10;

  useEffect(() => {
    loadExecutionLogs();
  }, [automationId, page]);

  const loadExecutionLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await executionService.getAutomationExecutionHistory(
        automationId,
        {
          page,
          limit: logsPerPage,
        }
      );

      setLogs(response.data);
      setTotalLogs(response.total);
      setIsLoading(false);
    } catch (err: any) {
      setError(
        `Failed to load execution logs: ${err.message || "Unknown error"}`
      );
      setIsLoading(false);
    }
  };

  const loadExecutionDetails = async (executionId: string) => {
    const log = logs.find((l) => l.id === executionId);
    if (log) {
      setSelectedLog(log);
    } else {
      try {
        setIsLoading(true);
        const details = await executionService.getExecutionDetail(executionId);
        setSelectedLog(details);
        setIsLoading(false);
      } catch (err: any) {
        setError(
          `Failed to load execution details: ${err.message || "Unknown error"}`
        );
        setIsLoading(false);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy HH:mm:ss");
    } catch {
      return dateStr;
    }
  };

  const getDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return "In progress";

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;

    if (durationMs < 1000) {
      return `${durationMs}ms`;
    }

    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(totalLogs / logsPerPage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Execution History</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-grow overflow-hidden">
          {/* Lista de ejecuciones */}
          <div className="w-1/2 pr-4 overflow-y-auto border-r">
            {isLoading && !selectedLog ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No execution logs found
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedLog?.id === log.id
                        ? "bg-blue-50 border-blue-300"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => loadExecutionDetails(log.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {getStatusIcon(log.status)}
                        <span className="ml-2 font-medium">
                          {formatDate(log.startTime)}
                        </span>
                      </div>
                      {getStatusBadge(log.status)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Duration: {getDuration(log.startTime, log.endTime)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 px-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Detalles de la ejecución */}
          <div className="w-1/2 pl-4 overflow-y-auto">
            {selectedLog ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">
                    Execution Details
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-gray-500">Status:</div>
                    <div>{getStatusBadge(selectedLog.status)}</div>
                    <div className="text-gray-500">Started:</div>
                    <div>{formatDate(selectedLog.startTime)}</div>
                    <div className="text-gray-500">Completed:</div>
                    <div>
                      {selectedLog.endTime
                        ? formatDate(selectedLog.endTime)
                        : "In progress"}
                    </div>
                    <div className="text-gray-500">Duration:</div>
                    <div>
                      {getDuration(selectedLog.startTime, selectedLog.endTime)}
                    </div>
                    <div className="text-gray-500">Execution ID:</div>
                    <div className="font-mono text-xs">{selectedLog.id}</div>
                  </div>
                </div>

                {selectedLog.error && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2 text-red-600">
                      Error
                    </h3>
                    <div className="bg-red-50 p-3 rounded-md border border-red-200">
                      <p className="font-medium">{selectedLog.error.message}</p>
                      {selectedLog.error.nodeId && (
                        <p className="text-sm mt-1">
                          Node:{" "}
                          <span className="font-mono">
                            {selectedLog.error.nodeId}
                          </span>
                        </p>
                      )}
                      {selectedLog.error.details && (
                        <pre className="mt-2 text-xs overflow-auto p-2 bg-red-100 rounded max-h-32">
                          {JSON.stringify(selectedLog.error.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-medium mb-2">Node Execution</h3>
                  <div className="space-y-3">
                    {selectedLog.nodesExecution.map((nodeExec) => (
                      <div
                        key={nodeExec.nodeId}
                        className="border rounded-md overflow-hidden"
                      >
                        <div
                          className={`p-2 flex justify-between items-center ${
                            nodeExec.status === "success"
                              ? "bg-green-50"
                              : nodeExec.status === "failed"
                              ? "bg-red-50"
                              : nodeExec.status === "skipped"
                              ? "bg-gray-50"
                              : "bg-blue-50"
                          }`}
                        >
                          <div className="flex items-center">
                            {getStatusIcon(nodeExec.status)}
                            <span className="ml-2 font-medium font-mono text-sm">
                              {nodeExec.nodeId}
                            </span>
                          </div>
                          {getStatusBadge(nodeExec.status)}
                        </div>

                        <div className="p-3 text-xs">
                          <div className="mb-2">
                            <div className="font-medium text-gray-700 mb-1">
                              Input:
                            </div>
                            <pre className="bg-gray-50 p-2 rounded overflow-auto max-h-20">
                              {JSON.stringify(nodeExec.inputData, null, 2)}
                            </pre>
                          </div>

                          {nodeExec.outputData && (
                            <div>
                              <div className="font-medium text-gray-700 mb-1">
                                Output:
                              </div>
                              <pre className="bg-gray-50 p-2 rounded overflow-auto max-h-20">
                                {JSON.stringify(nodeExec.outputData, null, 2)}
                              </pre>
                            </div>
                          )}

                          {nodeExec.error && (
                            <div className="mt-2">
                              <div className="font-medium text-red-600 mb-1">
                                Error:
                              </div>
                              <pre className="bg-red-50 p-2 rounded overflow-auto max-h-20 text-red-700">
                                {JSON.stringify(nodeExec.error, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Eye className="w-12 h-12 mb-2 opacity-20" />
                <p>Select an execution to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
