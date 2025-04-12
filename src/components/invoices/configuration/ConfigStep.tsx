import { useState } from "react";

import invoiceConfigurationService from "../../../services/invoiceConfigurationService";
import { ConfigCompany } from "../../../types/invoiceConfiguration";

const initialForm: ConfigCompany = {
  type_document_identification_id: 0,
  type_organization_id: 0,
  type_regime_id: 0,
  type_liability_id: 0,
  business_name: "",
  merchant_registration: "",
  municipality_id: 0,
  address: "",
  phone: 0,
  email: "",
  mail_host: "smtp.hostinger.com",
  mail_port: "465",
  mail_username: "no@no.com",
  mail_password: "12345",
  mail_encryption: "ssl",
  id_number: "",
  verification_number: "",
};

export function ConfigStep() {
  const [form, setForm] = useState<ConfigCompany>(initialForm);
  const [configStatus, setConfigStatus] = useState<undefined | boolean>(
    undefined
  );

  const handleSubmit = async () => {
    try {
      const response = await invoiceConfigurationService.configCompany(form);

      if (response) {
        setConfigStatus(true);
        // disable form inputs
        setForm(initialForm);
      }
    } catch (error) {
      console.error("Error in configCompany: ", error);
      setConfigStatus(false);
    }
  };

  const onChange = (
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* response message */}

        <div>
          <label
            htmlFor="type_document_identification_id"
            className="block text-sm font-medium text-gray-700"
          >
            Tipo de identificacion del facturador
          </label>

          <select
            id="type_document_identification_id"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={form.type_document_identification_id}
            onChange={onChange as any}
            name="type_document_identification_id"
          >
            <option value="0" disabled>
              Seleccione
            </option>
            <option value="1">Registro Civil</option>
            <option value="2">Tarjetas de Identidad</option>
            <option value="3">Cedula de ciudadania</option>
            <option value="4">Tarjeta de extranjeria</option>
            <option value="5">Cedula de extranjeria</option>
            <option value="6">Nit</option>
            <option value="7">Pasaporte</option>
            <option value="8">Documento de identificación extranjero</option>
            <option value="9">NIT de otro país</option>
            <option value="10">NUIP *</option>
            <option value="11">PEP (Permiso Especial de Permanencia)</option>
            <option value="12">PPT (Permiso Protección Temporal)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="type_organization_id"
            className="block text-sm font-medium text-gray-700"
          >
            Organization Type
          </label>

          <select
            name="type_organization_id"
            id="type_organization_id"
            value={form.type_organization_id}
            onChange={onChange as any}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="0" disabled>
              Seleccione
            </option>
            <option value="1">Persona Jurídica y asimiladas</option>
            <option value="2">Persona Natural y asimiladas</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="type_regime_id"
            className="block text-sm font-medium text-gray-700"
          >
            Regime Type
          </label>

          <select
            name="type_regime_id"
            id="type_regime_id"
            value={form.type_regime_id}
            onChange={onChange as any}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="0" disabled>
              Seleccione
            </option>
            <option value="1">Responsable de IVA</option>
            <option value="2">No Responsable de IVA</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="type_liability_id"
            className="block text-sm font-medium text-gray-700"
          >
            Liability Type
          </label>

          <select
            name="type_liability_id"
            id="type_liability_id"
            value={form.type_liability_id}
            onChange={onChange as any}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="0" disabled>
              Seleccione
            </option>
            <option value="7">Gran contribuyente</option>
            <option value="9">Autorretenedor</option>
            <option value="14">
              Agente de retención en el impuesto sobre las ventas
            </option>
            <option value="112">Régimen Simple de Tributación – SIMPLE</option>
            <option value="117">No responsable</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label
            htmlFor="business_name"
            className="block text-sm font-medium text-gray-700"
          >
            Business Name
          </label>
          <input
            type="text"
            name="business_name"
            id="business_name"
            value={form.business_name}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="id_number"
            className="block text-sm font-medium text-gray-700"
          >
            Nit
          </label>
          <input
            type="text"
            name="id_number"
            id="id_number"
            value={form.id_number}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="verification_number"
            className="block text-sm font-medium text-gray-700"
          >
            Codigo de verificación
          </label>
          <input
            type="text"
            name="verification_number"
            id="verification_number"
            value={form.verification_number}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="merchant_registration"
            className="block text-sm font-medium text-gray-700"
          >
            Merchant Registration
          </label>
          <input
            type="text"
            name="merchant_registration"
            id="merchant_registration"
            value={form.merchant_registration}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="municipality_id"
            className="block text-sm font-medium text-gray-700"
          >
            Municipality ID
          </label>

          <select
            id="municipality_id"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={form.municipality_id}
            onChange={onChange as any}
            name="municipality_id"
          >
            <option value="0" disabled>
              Seleccione
            </option>
            <option value="149">Bogotá D.C.</option>
            <option value="1">Medellín</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700"
        >
          Address
        </label>
        <input
          type="text"
          name="address"
          id="address"
          value={form.address}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone
          </label>
          <input
            type="number"
            name="phone"
            id="phone"
            value={form.phone}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={form.email}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Mail formuration
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="mail_host"
              className="block text-sm font-medium text-gray-700"
            >
              Mail Host
            </label>
            <input
              type="text"
              name="mail_host"
              id="mail_host"
              value={form.mail_host}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="mail_port"
              className="block text-sm font-medium text-gray-700"
            >
              Mail Port
            </label>
            <input
              type="text"
              name="mail_port"
              id="mail_port"
              value={form.mail_port}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="mail_username"
              className="block text-sm font-medium text-gray-700"
            >
              Mail Username
            </label>
            <input
              type="text"
              name="mail_username"
              id="mail_username"
              value={form.mail_username}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="mail_password"
              className="block text-sm font-medium text-gray-700"
            >
              Mail Password
            </label>
            <input
              type="password"
              name="mail_password"
              id="mail_password"
              value={form.mail_password}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="mail_encryption"
              className="block text-sm font-medium text-gray-700"
            >
              Mail Encryption
            </label>
            <input
              type="text"
              name="mail_encryption"
              id="mail_encryption"
              value={form.mail_encryption}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
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
