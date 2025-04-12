import { Database } from "lucide-react";
import { ISoftware } from "../../../types/invoiceConfig";
import useInvoiceConfigStore from "../../../store/invoiceConfigStore";

const Software = () => {
  // Usar el store de Zustand
  const invoiceConfig = useInvoiceConfigStore((state) => state.invoiceConfig);
  const updateInvoiceConfig = useInvoiceConfigStore(
    (state) => state.updateInvoiceConfig
  );

  // Los datos de software están dentro de invoiceConfig
  const software = invoiceConfig.software || { id: '', pin: '' };

  const onChange = (field: keyof ISoftware, value: string) => {
    // Actualizar el campo en el store
    updateInvoiceConfig('software', {
      ...software,
      [field]: value,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Database className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 ml-3">
            Configuración del Software
          </h3>
          <p className="text-sm text-gray-500 ml-3">
            Complete la información de su software de facturación electrónica.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="id"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ID del Software
          </label>
          <input
            type="text"
            name="id"
            id="id"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={software.id}
            onChange={(e) => onChange("id", e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="pin"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            PIN
          </label>
          <input
            type="text"
            name="pin"
            id="pin"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={software.pin}
            onChange={(e) => onChange("pin", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export default Software