import type { Invoice } from "../../types/invoice";

interface InvoiceNotesProps {
  notes?: string;
  terms?: string;
  shippingTerms?: string;
  onNotesChange: (notes: string) => void;
  onTermsChange: (terms: string) => void;
  onShippingTermsChange: (shippingTerms: string) => void;
}

export function InvoiceNotes({
  notes,
  terms,
  shippingTerms,
  onNotesChange,
  onTermsChange,
  onShippingTermsChange,
}: InvoiceNotesProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Notas y Términos</h2>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notas
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            placeholder="Notas adicionales para el cliente..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Términos de pago
          </label>
          <textarea
            value={terms}
            onChange={(e) => onTermsChange(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            placeholder="Términos y condiciones de la factura..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Términos de envío
          </label>
          <textarea
            value={shippingTerms}
            onChange={(e) => onShippingTermsChange(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            placeholder="Términos y condiciones de envío..."
          />
        </div>
      </div>
    </div>
  );
}
