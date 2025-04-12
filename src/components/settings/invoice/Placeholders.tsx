import { Text } from "lucide-react";
import { IPlaceholders } from "../../../types/invoiceConfig";
import useInvoiceConfigStore from "../../../store/invoiceConfigStore";

const Placeholders = () => {
  // Usar el store de Zustand en lugar del estado local
  const invoiceConfig = useInvoiceConfigStore((state) => state.invoiceConfig);
  const updatePlaceholders = useInvoiceConfigStore(
    (state) => state.updatePlaceholders
  );

  // Los placeholders están ahora dentro de invoiceConfig
  const placeholders = invoiceConfig.placeholders;

  const onChange = (field: keyof IPlaceholders, value: string) => {
    // Llamar a la función del store para actualizar el campo
    updatePlaceholders(field, value);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Text className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 ml-3">
            Placeholders de la factura
          </h3>
          <p className="text-sm text-gray-500 ml-3">
            Complete la información adicional que aparecerá en la factura.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="paymentTerms"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Payment Terms
          </label>
          <input
            type="text"
            name="paymentTerms"
            id="paymentTerms"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={placeholders.paymentTerms}
            onChange={(e) => onChange("paymentTerms", e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Currency
          </label>
          <input
            type="text"
            name="currency"
            id="currency"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={placeholders.currency}
            onChange={(e) => onChange("currency", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
          value={placeholders.notes}
          onChange={(e) => onChange("notes", e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="logoImg"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Logo Image URL
        </label>
        <input
          type="text"
          name="logoImg"
          id="logoImg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
          value={placeholders.logoImg}
          onChange={(e) => onChange("logoImg", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="foot_note"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Footnote
          </label>
          <textarea
            id="foot_note"
            name="foot_note"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={placeholders.foot_note}
            onChange={(e) => onChange("foot_note", e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="head_note"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Header Note
          </label>
          <textarea
            id="head_note"
            name="head_note"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={placeholders.head_note}
            onChange={(e) => onChange("head_note", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Placeholders;
