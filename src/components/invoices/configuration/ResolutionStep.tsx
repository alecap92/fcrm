import { useState } from "react";
import invoiceConfigurationService from "../../../services/invoiceConfigurationService";

const initialState = {
  type_document_id: "",
  prefix: "",
  resolution: "",
  resolution_date: "",
  technical_key: "",
  from: "",
  to: "",
  generated_to_date: "0",
  date_from: "",
  date_to: "",
};

export function ResolutionStep() {
  const [form, setForm] = useState(initialState);
  const [configStatus, setConfigStatus] = useState<undefined | boolean>(
    undefined
  );

  const handleSubmit = async () => {
    try {
      const response = await invoiceConfigurationService.configResolution(form);

      if (response.data) {
        setForm(initialState);
        setConfigStatus(true);
      }
    } catch (error) {
      console.error("Error in configResolution: ", error);
      setConfigStatus(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="space-y-6">
      {configStatus === true ? (
        <div
          className="bg-green-50 border-l-4 border-green-400 p-4"
          role="alert"
        >
          <p>Configuracion creada correctamente.</p>
        </div>
      ) : configStatus === false ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4" role="alert">
          <p>
            Ha ocurrido un error al crear la configuracion, revise la consola.
          </p>
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="type_document_id"
            className="block text-sm font-medium text-gray-700"
          >
            Document Type ID
          </label>

          <select
            name="type_document_id"
            id="type_document_id"
            value={form.type_document_id}
            onChange={onChange as any}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
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
            className="block text-sm font-medium text-gray-700"
          >
            Prefix
          </label>
          <input
            placeholder="Prefijo de la factura. Ej: FE"
            type="text"
            name="prefix"
            id="prefix"
            value={form.prefix}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="resolution"
          className="block text-sm font-medium text-gray-700"
        >
          Número de Resolucion
        </label>
        <input
          type="text"
          name="resolution"
          id="resolution"
          value={form.resolution}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="resolution_date"
            className="block text-sm font-medium text-gray-700"
          >
            Fecha de Resolución
          </label>
          <input
            type="date"
            name="resolution_date"
            id="resolution_date"
            value={form.resolution_date}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="technical_key"
            className="block text-sm font-medium text-gray-700"
          >
            Technical Key (desde el modulo de habilitacion)
          </label>
          <input
            type="text"
            name="technical_key"
            id="technical_key"
            value={form.technical_key}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label
            htmlFor="from"
            className="block text-sm font-medium text-gray-700"
          >
            Desde
          </label>
          <input
            type="number"
            name="from"
            id="from"
            value={form.from}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="to"
            className="block text-sm font-medium text-gray-700"
          >
            Hasta
          </label>
          <input
            type="number"
            name="to"
            id="to"
            value={form.to}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="generated_to_date"
            className="block text-sm font-medium text-gray-700"
          >
            Generated To Date
          </label>
          <input
            type="number"
            name="generated_to_date"
            id="generated_to_date"
            value={form.generated_to_date}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="date_from"
            className="block text-sm font-medium text-gray-700"
          >
            Date From
          </label>
          <input
            type="date"
            name="date_from"
            id="date_from"
            value={form.date_from}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="date_to"
            className="block text-sm font-medium text-gray-700"
          >
            Date To
          </label>
          <input
            type="date"
            name="date_to"
            id="date_to"
            value={form.date_to}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Submit
      </button>
    </div>
  );
}
