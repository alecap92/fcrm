import { useState, useRef, ChangeEvent } from "react";
import invoiceConfigurationService from "../../../services/invoiceConfigurationService";

export function CertificateStep() {
  const [password, setPassword] = useState("");
  const [certificate, setCertificate] = useState<File | null>(null);
  const [configStatus, setConfigStatus] = useState<undefined | boolean>(
    undefined
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCertificate(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!certificate) {
      alert("Please select a certificate file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("certificate", certificate);
      formData.append("password", password);

      await invoiceConfigurationService.configCertificate(formData);
      setConfigStatus(true);
    } catch (error) {
      console.error("Error in configCertificate: ", error);
      setConfigStatus(false);
    }
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
      <div>
        <label
          htmlFor="certificate"
          className="block text-sm font-medium text-gray-700"
        >
          Certificate (.p12)
        </label>
        <div className="mt-1 flex items-center">
          <input
            ref={fileInputRef}
            type="file"
            name="certificate"
            id="certificate"
            accept=".p12"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            required
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Only .p12 certificate files are allowed
        </p>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Certificate Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          placeholder="Enter certificate password"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
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
