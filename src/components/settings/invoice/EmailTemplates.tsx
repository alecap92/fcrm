import { Mail } from "lucide-react";
import { IEmail } from "../../../types/invoiceConfig";
import useInvoiceConfigStore from "../../../store/invoiceConfigStore";

const EmailTemplates = () => {
  // Usar el store de Zustand en lugar del estado local
  const invoiceConfig = useInvoiceConfigStore((state) => state.invoiceConfig);
  const updateEmailSettings = useInvoiceConfigStore(
    (state) => state.updateEmailSettings
  );

  // Los ajustes de email están ahora dentro de invoiceConfig
  const email = invoiceConfig.email;

  const onChange = (field: keyof IEmail, value: string | number | boolean) => {
    // Llamar a la función del store para actualizar el campo
    updateEmailSettings(field, value);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Mail className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 ml-3">
            Información de la cuenta de correo
          </h3>
          <p className="text-sm text-gray-500 ml-3">
            Complete la información de la cuenta de correo que se usará para
            enviar las facturas.
          </p>
        </div>
      </div>
      <div>
        <label
          htmlFor="mail_username"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          type="email"
          name="mail_username"
          id="mail_username"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
          value={email.mail_username}
          onChange={(e) => onChange("mail_username", e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="mail_password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          type="password"
          name="mail_password"
          id="mail_password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
          value={email.mail_password}
          onChange={(e) => onChange("mail_password", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="mail_host"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Host
          </label>
          <input
            type="text"
            name="mail_host"
            id="mail_host"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={email.mail_host}
            onChange={(e) => onChange("mail_host", e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="mail_port"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Puerto
          </label>
          <input
            type="number"
            name="mail_port"
            id="mail_port"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={email.mail_port}
            onChange={(e) => onChange("mail_port", parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="mail_encryption"
            name="mail_encryption"
            type="text"
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            value={email.mail_encryption}
            onChange={(e) => onChange("mail_encryption", e.target.checked)}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="secure" className="font-medium text-gray-700">
            Secure
          </label>
          <p className="text-gray-500">Enable secure connection (SSL/TLS)</p>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplates;
