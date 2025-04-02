import { useEffect, useState } from "react";
import { Save, FileText, Type, X } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { organizationService } from "../../services/organizationService";

export function QuotationSettings() {
  const { organization } = useAuth();

  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);

  const [quotationConfig, setQuotationConfig] = useState({
    quotationNumber: "",
    paymentTerms: "",
    shippingTerms: "",
    notes: "",
    footerText: "",
    bgImage: "",
  });

  // Pre-fill config when organization loads
  useEffect(() => {
    if (organization?.settings?.quotations) {
      setQuotationConfig(organization.settings.quotations);
    }
  }, [organization]);

  const handleChange = (field: string, value: string) => {
    setQuotationConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!organization) return;
    setLoading(true);
    try {
      const updatedOrg = {
        ...organization,
        settings: {
          ...organization.settings,
          quotations: quotationConfig,
        },
      };
      await organizationService.updateOrganization(updatedOrg);
      alert("Configuración guardada correctamente");
      setHasChanges(false);
    } catch (error) {
      console.error("Error al guardar configuración de cotizaciones", error);
      alert("Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Configuración de Cotizaciones
      </h2>

      <div className="space-y-6">
        {/* Básico */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4 flex-1 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Configuración Básica
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Formato de Numeración
                </label>
                <input
                  type="text"
                  value={quotationConfig.quotationNumber}
                  onChange={(e) =>
                    handleChange("quotationNumber", e.target.value)
                  }
                  className="input"
                  placeholder="Ej: QT-{YEAR}-{NUMBER}"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Variables disponibles: {"{YEAR}"}, {"{MONTH}"}, {"{NUMBER}"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Términos de Pago
                </label>
                {console.log(quotationConfig) as any}
                <textarea
                  rows={3}
                  value={quotationConfig.paymentTerms}
                  onChange={(e) => handleChange("paymentTerms", e.target.value)}
                  className="input"
                  placeholder="Ej: 50% de anticipo, 50% contra entrega"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Términos de Envío
                </label>
                <textarea
                  rows={3}
                  value={quotationConfig.shippingTerms}
                  onChange={(e) =>
                    handleChange("shippingTerms", e.target.value)
                  }
                  className="input"
                  placeholder="Ej: Entrega en 5-7 días hábiles"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plantilla */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Type className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-4 flex-1 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Plantilla de Cotización
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notas Predeterminadas
                </label>
                <textarea
                  rows={4}
                  value={quotationConfig.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  className="input"
                  placeholder="Notas que aparecerán por defecto en las cotizaciones"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Texto del Pie de Página
                </label>
                <textarea
                  rows={3}
                  value={quotationConfig.footerText}
                  onChange={(e) => handleChange("footerText", e.target.value)}
                  className="input"
                  placeholder="Texto que aparecerá en el pie de página de todas las cotizaciones"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Imagen de Fondo
                </label>
                <div className="mt-1 flex items-center gap-4">
                  {quotationConfig.bgImage && (
                    <div className="relative w-32 h-32">
                      <img
                        src={quotationConfig.bgImage}
                        alt="Background"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                        onClick={() => handleChange("bgImage", "")}
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="url"
                      value={quotationConfig.bgImage}
                      onChange={(e) => handleChange("bgImage", e.target.value)}
                      className="input"
                      placeholder="URL de la imagen de fondo"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Ingresa la URL de una imagen para usarla como marca de
                      agua en las cotizaciones.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guardar */}
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
