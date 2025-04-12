import React, { useState } from 'react'
import { FileText } from "lucide-react";
import { ICertificado } from "../../../types/invoiceConfig";
import useInvoiceConfigStore from "../../../store/invoiceConfigStore";
import InvoiceConfiguration from '../../../pages/InvoiceConfiguration';
import invoiceConfigurationService from '../../../services/invoiceConfigurationService';
import { useAuth } from '../../../contexts/AuthContext';

const Certificado = () => {
  const [status, setStatus] = useState(false);
  const invoiceConfig = useInvoiceConfigStore((state) => state.invoiceConfig);
  const updateInvoiceConfig = useInvoiceConfigStore(
    (state) => state.updateInvoiceConfig
  );
  const { organization } = useAuth();

  const certificado = invoiceConfig.certificado || { file: null, password: '' };

  const onChange = (field: keyof ICertificado, value: any) => {
    // updateInvoiceConfig('certificado', {
    //   ...certificado,
    //   [field]: value,
    // });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setStatus(true);
    } else {
      setStatus(false);
    }
  };

  const handleUploadFile = async () => {
    console.log('Subiendo archivo...');
    
    const formData = new FormData();
    const fileInput = document.getElementById('certificado') as HTMLInputElement;
    const file = fileInput.files?.[0];
    
    if (file && organization._id) {
      formData.append('certificado', file);
      formData.append('password', certificado.password);
      formData.append('organizationId', organization._id);
      
      await invoiceConfigurationService.configCertificate(formData);
    } else {
      console.error('No se puede subir el archivo: falta el archivo o el ID de la organización');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 ml-3">
            Certificado Digital
          </h3>
          <p className="text-sm text-gray-500 ml-3">
            Adjunte su certificado digital (.p12) y la contraseña correspondiente.
          </p>
        </div>
        
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label
            htmlFor="certificado"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Adjunta certificado digital (.p12)
          </label>
          <input
            type="file"
            name="certificado"
            id="certificado"
            accept=".p12"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            onChange={handleFileChange}
          />
        </div>
        <div className="">
          <button
            onClick={handleUploadFile}
            className={`${status ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'} text-white py-2 px-4 rounded-md`}
            disabled={!status}
          >
            Subir Archivo
          </button>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
            value={certificado.password}
            onChange={(e) => onChange("password", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export default Certificado 