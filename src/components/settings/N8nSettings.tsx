import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Save, X, Zap, Globe, Key, Settings, Code } from "lucide-react";

/*
Formulario para crear una nueva automatización N8n
Campos: Nombre, Url, Body, method, apiKey, headers,

Body: Deberiamos mostrar el json que espera n8n, nos falta ver como formatear el json desde el chat. 

*/

interface automationFormData {
  name: string;
  url: string;
  body: string;
  method: string;
  apiKey: string;
  headers: string;
}

const N8nSettings = () => {
  const [formData, setFormData] = useState<automationFormData>({
    name: "",
    url: "",
    body: "",
    method: "POST",
    apiKey: "",
    headers: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para guardar la automatización
    console.log("Guardando automatización:", formData);
  };

  const handleCancel = () => {
    // Lógica para cancelar
    console.log("Cancelando creación");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Crear Automatización N8n
            </h1>
            <p className="text-gray-600">
              Configura una nueva automatización para integrar con N8n
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Información Básica */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Información Básica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Nombre de la Automatización *
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Envío automático de emails"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="method"
                  className="text-sm font-medium text-gray-700"
                >
                  Método HTTP
                </label>
                <select
                  id="method"
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuración de Endpoint */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Configuración del Endpoint
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="url"
                  className="text-sm font-medium text-gray-700"
                >
                  URL del Webhook N8n *
                </label>
                <Input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://tu-instancia-n8n.com/webhook/..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Autenticación */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5" />
              Autenticación
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="apiKey"
                  className="text-sm font-medium text-gray-700"
                >
                  API Key
                </label>
                <Input
                  type="password"
                  id="apiKey"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu API key de N8n"
                />
                <p className="text-xs text-gray-500">
                  Opcional: Para autenticación con API key
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="headers"
                  className="text-sm font-medium text-gray-700"
                >
                  Headers Adicionales
                </label>
                <Input
                  type="text"
                  id="headers"
                  name="headers"
                  value={formData.headers}
                  onChange={handleInputChange}
                  placeholder='{"Content-Type": "application/json"}'
                />
                <p className="text-xs text-gray-500">
                  Formato JSON para headers adicionales
                </p>
              </div>
            </div>
          </div>

          {/* Cuerpo de la Petición */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Cuerpo de la Petición
            </h3>

            <div className="space-y-2">
              <label
                htmlFor="body"
                className="text-sm font-medium text-gray-700"
              >
                JSON Body
              </label>
              <textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleInputChange}
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder='{"event": "lead_created", "data": {...}}'
              />
              <p className="text-xs text-gray-500">
                JSON que se enviará al webhook de N8n
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        {formData.name && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Vista Previa
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{formData.method}</Badge>
                <span className="text-blue-700">
                  {formData.url || "URL no configurada"}
                </span>
              </div>
              <p className="text-blue-600">
                <strong>Nombre:</strong> {formData.name}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button type="submit" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Guardar Automatización
          </Button>
        </div>
      </form>
    </div>
  );
};

export default N8nSettings;
