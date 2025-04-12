import { FileText } from "lucide-react";
import { IResolutionNumber } from "../../../types/invoiceConfig";
import useInvoiceConfigStore from "../../../store/invoiceConfigStore";

const InvoiceResolution = () => {
  // Usar el store de Zustand en lugar del estado local
  const invoiceConfig = useInvoiceConfigStore((state) => state.invoiceConfig);
  const updateResolutionNumber = useInvoiceConfigStore(
    (state) => state.updateResolutionNumber
  );

  // La información de resolución está ahora dentro de invoiceConfig
  const resolution = invoiceConfig.resolutionNumber;

  const onChange = (field: keyof IResolutionNumber, value: string) => {
    // Llamar a la función del store para actualizar el campo
    updateResolutionNumber(field, value);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 ml-3">
            Información de la resolución
          </h3>
          <p className="text-sm text-gray-500 ml-3">
            Complete la información de la resolución de facturación que la Dian
            le dio.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="document_type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Document Type
          </label>

          <select
            name="type_document_id"
            id="type_document_id"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={resolution.type_document_id}
            onChange={(e) => onChange("type_document_id", e.target.value)}
          >
            <option value="" disabled>
              Seleccione
            </option>
            <option value="1">Factura de Venta Nacional</option>
            <option value="2">Factura de Exportación</option>
            <option value="3">Factura de Contingencia</option>
            <option value="4">Nota Crédito</option>
            <option value="5">Nota Débito</option>
            <option value="6">ZIP</option>
            <option value="7">AttachedDocument</option>
            <option value="8">ApplicationResponse</option>
            <option value="9">Nomina Individual</option>
            <option value="10">Nomina Individual de Ajuste</option>
            <option value="11">Documento Soporte Electrónico</option>
            <option value="12">Factura electrónica de Venta - tipo 04</option>
            <option value="13">
              Nota de Ajuste al Documento Soporte Electrónico
            </option>
            <option value="14">Eventos (ApplicationResponse)</option>
            <option value="15">
              Documento equivalente electrónico del tiquete de máquina
              registradora con sistema P.O.S.
            </option>
            <option value="16">Boleta de ingreso a cine</option>
            <option value="17">
              Boleta de ingreso a espectáculos públicos
            </option>
            <option value="18">
              Documento en juegos localizados y no localizados - relación diaria
              de control de ventas
            </option>
            <option value="19">
              Tiquete de transporte de pasajeros Terrestre
            </option>
            <option value="20">
              Documento expedido para el cobro de peajes
            </option>
            <option value="21">
              Extracto Expedido por Sociedades Financieras y Fondos
            </option>
            <option value="22">
              Tiquete de Billete de Transporte Aéreo de Pasajeros
            </option>
            <option value="23">
              Documento de Operación de Bolsa de Valores, Agropecuaria y de
              Otros Comodities
            </option>
            <option value="24">
              Documento Expedido para los Servicios Públicos y Domiciliarios
            </option>
            <option value="25">
              Nota de Ajuste de tipo debito al Documento Equivalente
            </option>
            <option value="26">
              Nota de Ajuste de tipo crédito al Documento Equivalente
            </option>
          </select>

      
        </div>

        <div>
          <label
            htmlFor="prefix"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Prefix
          </label>
          <input
            type="text"
            name="prefix"
            id="prefix"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={resolution.prefix}
            onChange={(e) => onChange("prefix", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="resolution"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Resolution Number
        </label>
        <input
          type="text"
          name="resolution"
          id="resolution"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
          value={resolution.resolution}
          onChange={(e) => onChange("resolution", e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="resolution_date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Resolution Date
        </label>
        <input
          type="date"
          name="resolution_date"
          id="resolution_date"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
          value={resolution.resolution_date}
          onChange={(e) => onChange("resolution_date", e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="technical_key"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Clave Técnica
        </label>
        <input
          type="text"
          name="technical_key"
          id="technical_key"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
          value={resolution.technical_key}
          onChange={(e) => onChange("technical_key", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="from"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            From
          </label>
          <input
            type="text"
            name="from"
            id="from"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={resolution.from}
            onChange={(e) => onChange("from", e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="to"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            To
          </label>
          <input
            type="text"
            name="to"
            id="to"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={resolution.to}
            onChange={(e) => onChange("to", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="date_from"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date From
          </label>
          <input
            type="date"
            name="date_from"
            id="date_from"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={resolution.date_from}
            onChange={(e) => onChange("date_from", e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="date_to"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date To
          </label>
          <input
            type="date"
            name="date_to"
            id="date_to"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={resolution.date_to}
            onChange={(e) => onChange("date_to", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceResolution;
