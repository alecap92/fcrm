import { useState } from "react";
import invoiceConfigurationService from "../../../services/invoiceConfigurationService";

const testInvoice = {
  number: 0,
  type_document_id: 1,
  id_set_pruebas: "",
  date: new Date().toISOString().split("T")[0],
  time: new Date().toTimeString().slice(0, 8),
  resolution_number: "",
  prefix: "",
  notes:
    "ESTA ES UNA NOTA DE PRUEBA, ESTA ES UNA NOTA DE PRUEBA, ESTA ES UNA NOTA DE PRUEBA, ESTA ES UNA NOTA DE PRUEBA, ESTA ES UNA NOTA DE PRUEBA, ESTA ES UNA NOTA DE PRUEBA, ESTA ES UNA NOTA DE PRUEBA, ESTA ES UNA NOTA DE PRUEBA, ESTA ES UNA NOTA DE PRUEBA, ESTA ES UNA NOTA DE PRUEBA, ESTA ES UNA NOTA DE PRUEBA, ESTA ES UNA NOTA DE PRUEBA, ESTA ES UNA NOTA DE PRUEBA, ESTA ES UNA NOTA DE PRUEBA",
  disable_confirmation_text: true,
  establishment_name: "",
  establishment_address: "CR 17 118 32 TO 2 AP 503",
  establishment_phone: "3132925094",
  establishment_municipality: 149,
  establishment_email: "alejandro.cabrejo@gmail.com",
  sendmail: false,
  sendmailtome: false,
  head_note:
    "PRUEBA DE TEXTO LIBRE QUE DEBE POSICIONARSE EN EL ENCABEZADO DE PAGINA DE LA REPRESENTACION GRAFICA DE LA FACTURA ELECTRONICA VALIDACION PREVIA DIAN",
  foot_note:
    "PRUEBA DE TEXTO LIBRE QUE DEBE POSICIONARSE EN EL PIE DE PAGINA DE LA REPRESENTACION GRAFICA DE LA FACTURA ELECTRONICA VALIDACION PREVIA DIAN",
  customer: {
    identification_number: 1020776180,
    dv: 1,
    name: "Alejandro Cabrejo",
    phone: "3132925094",
    address: "CR 17 118 32",
    email: "alejandro.cabrejo@gmail.com",
    merchant_registration: "0000000-00",
    type_document_identification_id: 6,
    type_organization_id: 1,
    type_liability_id: 7,
    municipality_id: 112,
    type_regime_id: 1,
  },
  payment_form: {
    payment_form_id: 1,
    payment_method_id: 10,
    payment_due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    duration_measure: "0",
  },
  legal_monetary_totals: {
    line_extension_amount: "769500.00",
    tax_exclusive_amount: "950000.00",
    tax_inclusive_amount: "950000.00",
    allowance_total_amount: "0.00",
    payable_amount: "950000.00",
  },
  tax_totals: [
    {
      tax_id: 1,
      tax_amount: "180500",
      percent: "19",
      taxable_amount: "950000.00",
    },
  ],
  invoice_lines: [
    {
      unit_measure_id: 70,
      invoiced_quantity: "1",
      line_extension_amount: "769500.00",
      free_of_charge_indicator: false,
      allowance_charges: [
        {
          charge_indicator: false,
          allowance_charge_reason: "DESCUENTO GENERAL",
          amount: "50000.00",
          base_amount: "1000000.00",
        },
      ],
      tax_totals: [
        {
          tax_id: 1,
          tax_amount: "180500",
          taxable_amount: "950000",
          percent: "19.00",
        },
      ],
      description: "COMISION POR SERVICIOS",
      notes: "ESTA ES UNA PRUEBA DE NOTA DE DETALLE DE LINEA.",
      code: "COMISION",
      type_item_identification_id: 4,
      price_amount: "1000000.00",
      base_quantity: "1",
    },
  ],
};

export function TestStep() {
  const [form, setForm] = useState(testInvoice);

  const [configStatus, setConfigStatus] = useState<undefined | boolean>(
    undefined
  );

  const handleSubmit = async () => {
    try {
      const response = await invoiceConfigurationService.testInvoice(form);
      if (response) {
        setConfigStatus(true);
        setForm(testInvoice);
      }
    } catch (error) {
      console.error("Error in handleSubmit: ", error);
      setConfigStatus(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
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

      <div className="space-y-4">
        <div>
          <label
            htmlFor="number"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Número de factura
          </label>
          <input
            type="number"
            id="number"
            name="number"
            value={form.number}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="resolution_number"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Número de resolución
          </label>
          <input
            type="text"
            id="resolution_number"
            name="resolution_number"
            value={form.resolution_number}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="prefix"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Prefijo
          </label>
          <input
            type="text"
            id="prefix"
            name="prefix"
            value={form.prefix}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="establishment_name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre del establecimiento
          </label>
          <input
            type="text"
            id="establishment_name"
            name="establishment_name"
            value={form.establishment_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="id_set_pruebas"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Id Set de pruebas
          </label>
          <input
            type="text"
            id="id_set_pruebas"
            name="id_set_pruebas"
            value={form.id_set_pruebas}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="pt-2">
          <button
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Probar factura
          </button>
        </div>
      </div>
    </div>
  );
}
