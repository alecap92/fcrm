import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "../ui/button";

interface QuotesNotesProps {
  observaciones?: string;
  terms?: string;
  shippingTerms?: string;
  onNotesChange: (notes: string) => void;
  onPaymentTermsChange: (terms: string) => void;
  onShippingTermsChange: (shippingTerms: string) => void;
}

export function QuotesNotes({
  observaciones,
  terms,
  shippingTerms,
  onNotesChange,
  onPaymentTermsChange,
  onShippingTermsChange,
}: QuotesNotesProps) {
  const { organization } = useAuth();
  const navigate = useNavigate();

  // Verificar si las configuraciones de cotizaciones están disponibles
  const hasQuotationSettings = organization?.settings?.quotations;
  const quotationSettings = hasQuotationSettings
    ? organization.settings.quotations
    : null;

  // Estado local para manejar las notas y términos
  const [localObservaciones, setlocalObservaciones] = useState(observaciones);
  const [localTerms, setLocalTerms] = useState(terms);
  const [localShippingTerms, setLocalShippingTerms] = useState(shippingTerms);

  // Cargar valores del contexto de autenticación (si están disponibles)
  useEffect(() => {
    if (quotationSettings) {
      setlocalObservaciones(quotationSettings.notes || "");
      setLocalTerms(quotationSettings.paymentTerms?.[0] || "");
      setLocalShippingTerms(quotationSettings.shippingTerms?.[0] || "");
    }
  }, [quotationSettings]);

  // Si no hay configuraciones, mostrar mensaje de configuración requerida
  if (!hasQuotationSettings) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">
            Observaciones y Términos
          </h2>
        </div>
        <div className="p-6 text-center">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Configuración Requerida
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Configura los términos de pago y envío en ajustes.
          </p>
          <Button size="sm" onClick={() => navigate("/settings")}>
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">
          Observaciones y Términos
        </h2>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Observaciones
          </label>
          <textarea
            value={localObservaciones}
            onChange={(e) => {
              setlocalObservaciones(e.target.value);
              onNotesChange(e.target.value);
            }}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            placeholder="Notas adicionales para el cliente..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Términos de pago
          </label>
          <select
            value={localTerms}
            onChange={(e) => {
              setLocalTerms(e.target.value);
              onPaymentTermsChange(e.target.value);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
          >
            <option value="">Seleccionar</option>
            {quotationSettings?.paymentTerms?.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Términos de envío
          </label>
          <select
            value={localShippingTerms}
            onChange={(e) => {
              setLocalShippingTerms(e.target.value);
              onShippingTermsChange(e.target.value);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
          >
            <option value="">Seleccionar</option>
            {quotationSettings?.shippingTerms?.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
