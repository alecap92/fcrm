import type { Invoice } from "../../types/invoice";
import { useEffect, useState } from "react";

interface InvoiceNotesProps {
  notes?: string;
  terms?: string;
  shippingTerms?: string;
  onNotesChange: (notes: string) => void;
  onTermsChange: (terms: string) => void;
  onShippingTermsChange: (shippingTerms: string) => void;
}

export function InvoiceNotes({
  notes = "",
  onNotesChange,
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
            rows={8}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            placeholder="Notas adicionales, términos de pago y términos de envío..."
          />
          <p className="mt-2 text-xs text-gray-500">
            Puedes separar las secciones agregando "TÉRMINOS DE PAGO:" y "TÉRMINOS DE ENVÍO:" en líneas separadas.
          </p>
        </div>
      </div>
    </div>
  );
}
