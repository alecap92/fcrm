import React, { useState } from "react";
import { Play, TestTube, Check, X, Copy, Download } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { useToast } from "../../../components/ui/toast";

interface TestResult {
  id: string;
  timestamp: string;
  webhookName: string;
  endpoint: string;
  method: string;
  status: number;
  response: any;
  duration: number;
  success: boolean;
  error?: string;
}

export function WebhookTester() {
  const [testData, setTestData] = useState({
    endpoint: "",
    method: "POST" as "GET" | "POST" | "PUT" | "PATCH",
    headers: "",
    body: "",
    timeout: 30,
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  const toast = useToast();

  const handleTest = async () => {
    if (!testData.endpoint.trim()) {
      toast.show({
        title: "Error",
        description: "El endpoint es requerido",
        type: "error",
      });
      return;
    }

    try {
      setIsTesting(true);
      const startTime = Date.now();

      // Preparar headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "FusionCRM-WebhookTester/1.0",
      };

      // Parsear headers personalizados
      if (testData.headers.trim()) {
        try {
          const customHeaders = JSON.parse(testData.headers);
          Object.assign(headers, customHeaders);
        } catch (error) {
          console.warn("Error parseando headers personalizados:", error);
        }
      }

      // Preparar body
      let body: string | undefined;
      if (testData.method !== "GET" && testData.body.trim()) {
        body = testData.body;
      }

      // Ejecutar test
      const response = await fetch(testData.endpoint, {
        method: testData.method,
        headers,
        body,
        signal: AbortSignal.timeout(testData.timeout * 1000),
      });

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { rawResponse: responseText };
      }

      const duration = Date.now() - startTime;
      const success = response.ok;

      const result: TestResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        webhookName: "Test Manual",
        endpoint: testData.endpoint,
        method: testData.method,
        status: response.status,
        response: responseData,
        duration,
        success,
      };

      setTestResults((prev) => [result, ...prev]);
      setSelectedResult(result);

      toast.show({
        title: success ? "Éxito" : "Error",
        description: `Webhook respondió con status ${response.status}`,
        type: success ? "success" : "error",
      });
    } catch (error: any) {
      const duration = Date.now() - Date.now();
      const result: TestResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        webhookName: "Test Manual",
        endpoint: testData.endpoint,
        method: testData.method,
        status: 0,
        response: null,
        duration,
        success: false,
        error: error.message,
      };

      setTestResults((prev) => [result, ...prev]);
      setSelectedResult(result);

      toast.show({
        title: "Error",
        description: `Error ejecutando webhook: ${error.message}`,
        type: "error",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.show({
      title: "Copiado",
      description: "Texto copiado al portapapeles",
      type: "success",
    });
  };

  const downloadResult = (result: TestResult) => {
    const data = {
      testResult: result,
      testData: testData,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webhook-test-${result.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearResults = () => {
    setTestResults([]);
    setSelectedResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Configuración del Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Testing de Webhooks
          </CardTitle>
          <CardDescription>
            Prueba tus webhooks antes de configurarlos en las automatizaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endpoint">Endpoint *</Label>
              <Input
                id="endpoint"
                value={testData.endpoint}
                onChange={(e) =>
                  setTestData((prev) => ({ ...prev, endpoint: e.target.value }))
                }
                placeholder="https://tu-webhook.com/endpoint"
              />
            </div>

            <div>
              <Label htmlFor="method">Método HTTP</Label>
              <select
                id="method"
                value={testData.method}
                onChange={(e) =>
                  setTestData((prev) => ({
                    ...prev,
                    method: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="headers">Headers Personalizados (JSON)</Label>
            <Textarea
              id="headers"
              value={testData.headers}
              onChange={(e) =>
                setTestData((prev) => ({ ...prev, headers: e.target.value }))
              }
              placeholder='{"Authorization": "Bearer token", "X-Custom-Header": "value"}'
              rows={3}
            />
          </div>

          {testData.method !== "GET" && (
            <div>
              <Label htmlFor="body">Body de la Petición</Label>
              <Textarea
                id="body"
                value={testData.body}
                onChange={(e) =>
                  setTestData((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder='{"key": "value", "data": "test"}'
                rows={4}
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="timeout">Timeout (segundos)</Label>
              <Input
                id="timeout"
                type="number"
                value={testData.timeout}
                onChange={(e) =>
                  setTestData((prev) => ({
                    ...prev,
                    timeout: Number(e.target.value),
                  }))
                }
                min="1"
                max="300"
                className="w-24"
              />
            </div>

            <Button
              onClick={handleTest}
              disabled={isTesting || !testData.endpoint.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Probando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Probar Webhook
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados de Tests */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resultados de Tests</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearResults}>
                  Limpiar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedResult?.id === result.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={result.success ? "default" : "destructive"}
                      >
                        {result.success ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Éxito
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Error
                          </>
                        )}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(result.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{result.method}</Badge>
                      <Badge variant="outline">{result.status || "N/A"}</Badge>
                      <span className="text-sm text-gray-500">
                        {result.duration}ms
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 break-all mb-2">
                    {result.endpoint}
                  </p>

                  {result.error && (
                    <p className="text-sm text-red-600 mb-2">
                      Error: {result.error}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(result.response, null, 2)
                        )
                      }
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar Respuesta
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadResult(result)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalle del Resultado Seleccionado */}
      {selectedResult && (
        <Card>
          <CardHeader>
            <CardTitle>Detalle del Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Respuesta del Webhook</Label>
                <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(selectedResult.response, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Información del Test</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <p>
                      <strong>Endpoint:</strong> {selectedResult.endpoint}
                    </p>
                    <p>
                      <strong>Método:</strong> {selectedResult.method}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedResult.status || "N/A"}
                    </p>
                    <p>
                      <strong>Duración:</strong> {selectedResult.duration}ms
                    </p>
                    <p>
                      <strong>Timestamp:</strong>{" "}
                      {new Date(selectedResult.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Headers Enviados</Label>
                  <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                    <pre className="text-sm">
                      {JSON.stringify(
                        {
                          "Content-Type": "application/json",
                          "User-Agent": "FusionCRM-WebhookTester/1.0",
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
