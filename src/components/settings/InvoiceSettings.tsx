import { useEffect, useState } from "react";
import { Save, FileText, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

import { useAuth } from "../../contexts/AuthContext";
import { format } from "date-fns";
import { organizationService } from "../../services/organizationService";
import { InvoiceConfig } from "../../types/settings";

export function InvoiceSettings() {
  const { organization } = useAuth();
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoiceConfig, setInvoiceConfig] = useState<InvoiceConfig>({
    resolution: 0,
    from: 0,
    to: 0,
    prefix: "",
    type_document_id: 9,
    resolution_date: "",
    technical_key: "",
    generated_to_date: 0,
    date_from: "",
    date_to: "",
  });

  const handleSave = async () => {
    if (!organization) return;

    setLoading(true);
    try {
      const updatedOrg = {
        ...organization,
        settings: { ...organization.settings, invoiceSettings: invoiceConfig },
      };

      await organizationService.updateOrganization(updatedOrg);
      alert("Configuración de facturación guardada correctamente");
      setHasChanges(false);
    } catch (error: any) {
      console.error("Error al guardar configuración:", error);
      alert("Error al guardar configuración de facturación");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setInvoiceConfig((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  useEffect(() => {
    if (organization) {
      setInvoiceConfig(organization.settings.invoiceSettings);
    }
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Configuración de Facturación
      </h2>

      <div className="space-y-6">
        {/* Resolución */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Resolución de Facturación
              </h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Resolución
                  </label>
                  <input
                    type="date"
                    value={
                      invoiceConfig?.resolution_date ||
                      format(new Date(), "yyyy-MM-dd")
                    }
                    onChange={(e) =>
                      handleChange("resolution_date", e.target.value)
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número de Resolución
                  </label>
                  <input
                    type="text"
                    value={invoiceConfig?.resolution || ""}
                    onChange={(e) => handleChange("resolution", e.target.value)}
                    className="input"
                    placeholder="Ej: 18764000001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Prefijo
                  </label>
                  <input
                    type="text"
                    value={invoiceConfig?.prefix || ""}
                    onChange={(e) => handleChange("prefix", e.target.value)}
                    className="input"
                    placeholder="Ej: SETP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Clave Técnica
                  </label>
                  <input
                    type="text"
                    value={invoiceConfig?.technical_key || ""}
                    onChange={(e) =>
                      handleChange("technical_key", e.target.value)
                    }
                    className="input"
                    placeholder="Clave técnica de la DIAN"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rango de numeración */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Rango de Numeración
              </h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Desde
                  </label>
                  <input
                    type="number"
                    value={invoiceConfig?.from || ""}
                    onChange={(e) =>
                      handleChange("from", Number(e.target.value))
                    }
                    className="input"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hasta
                  </label>
                  <input
                    type="number"
                    value={invoiceConfig?.to || ""}
                    onChange={(e) => handleChange("to", Number(e.target.value))}
                    className="input"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={invoiceConfig?.date_from || ""}
                    onChange={(e) => handleChange("date_from", e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={invoiceConfig?.date_to || ""}
                    onChange={(e) => handleChange("date_to", e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado actual */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Estado Actual
              </h3>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Facturas generadas hasta la fecha:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {invoiceConfig?.generated_to_date || 0}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-action h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        ((invoiceConfig?.generated_to_date || 0) /
                          (invoiceConfig?.to || 1)) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {invoiceConfig?.to && invoiceConfig?.generated_to_date
                    ? `${
                        invoiceConfig.to - invoiceConfig.generated_to_date
                      } facturas disponibles en el rango actual`
                    : "Configure el rango de numeración para ver las facturas disponibles"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!hasChanges || loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
}
