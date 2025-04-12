import { Building } from "lucide-react";
import { ICompanyInfo } from "../../../types/invoiceConfig";
import useInvoiceConfigStore from "../../../store/invoiceConfigStore";

const CompanyInfo = () => {
  // Usar el store de Zustand en lugar del estado local
  const invoiceConfig = useInvoiceConfigStore((state) => state.invoiceConfig);
  const updateCompanyInfo = useInvoiceConfigStore(
    (state) => state.updateCompanyInfo
  );

  // La información de la compañía está ahora dentro de invoiceConfig
  const companyInfo = invoiceConfig.companyInfo;

  const onChange = (field: keyof ICompanyInfo, value: string) => {
    // Llamar a la función del store para actualizar el campo
    updateCompanyInfo(field, value);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Building className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 ml-3">
            Información de la empresa
          </h3>
          <p className="text-sm text-gray-500 ml-3">
            Complete la información de su empresa que aparecerá en la factura.
          </p>
        </div>
      </div>
      <div className="ml-4 flex-1"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={companyInfo.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Address
          </label>
          <input
            type="text"
            name="address"
            id="address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={companyInfo.address}
            onChange={(e) => onChange("address", e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Telefono
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={companyInfo.phone}
            onChange={(e) => onChange("phone", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="municipality_id"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            City
          </label>
         
           <select
            id="municipality_id"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={companyInfo.municipality_id}
            onChange={(e) => onChange("municipality_id", e.target.value)}
            name="municipality_id"
          >
            <option value="0" disabled>
              Seleccione
            </option>
            <option value="149">Bogotá D.C.</option>
            <option value="1">Medellín</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="type_document_identification_id"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ID Type
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={companyInfo.type_document_identification_id}
            onChange={(e) => onChange("type_document_identification_id", e.target.value)}
            name="type_document_identification_id"
            id="type_document_identification_id"
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Organization Type
          </label>
          <select
            name="type_organization_id"
            id="type_organization_id"
            value={companyInfo.type_organization_id}
            onChange={(e) => onChange("type_organization_id", e.target.value)}
             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
          >
            <option value="0" disabled>
              Seleccione
            </option>
            <option value="1">Persona Jurídica y asimiladas</option>
            <option value="2">Persona Natural y asimiladas</option>
          </select>
          
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="type_regime_id"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Regime Type
          </label>
          <select
            name="type_regime_id"
            id="type_regime_id"
            value={companyInfo.type_regime_id}
            onChange={(e) => onChange("type_regime_id", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Liability Type
          </label>
          <select
            name="type_liability_id"
            id="type_liability_id"
            value={companyInfo.type_liability_id}
            onChange={(e) => onChange("type_liability_id", e.target.value)}
           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
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

      <div>
        <label
          htmlFor="business_name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Company Name
        </label>
        <input
          type="text"
          name="business_name"
          id="business_name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
          value={companyInfo.business_name}
          onChange={(e) => onChange("business_name", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="nit"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            NIT
          </label>
          <input
            type="text"
            name="nit"
            id="nit"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={companyInfo.nit}
            onChange={(e) => onChange("nit", e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="dv"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            DV
          </label>
          <input
            type="text"
            name="dv"
            id="dv"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={companyInfo.dv}
            onChange={(e) => onChange("dv", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;
