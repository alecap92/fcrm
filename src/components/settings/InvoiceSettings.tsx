import { useEffect, useState } from "react";
import {
  FileText,
  Building,
  Mail,
  Text,
  File,
  CreditCard,
  AlertCircle,
  Plus,
  Loader,
  Database,
  Settings,

} from "lucide-react";
import { Button } from "../ui/button";

import CompanyInfo from "./invoice/CompanyInfo";
import EmailTemplates from "./invoice/EmailTemplates";
import Placeholders from "./invoice/Placeholders";
import { useToast } from "../ui/toast";
import useInvoiceConfigStore from "../../store/invoiceConfigStore";
import { IInvoiceConfig } from "../../types/invoiceConfig";
import Software from "./invoice/Software";
import Certificado from "./invoice/Certificado";
import InvoiceResolution from "./invoice/InvoiceResolution";
import Actions from "./invoice/Actions";

export function InvoiceSettings() {
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const toast = useToast();

  // Usando el store Zustand para todas las operaciones
  const {
    invoiceConfig,
    setInvoiceConfig,
    saveInvoiceConfig,
    isLoading,
    error,
    clearError,
    configExists,
    checkConfigExists,
    createInvoiceConfig,
  } = useInvoiceConfigStore();

  const tabs = [
    { id: 0, label: "Resolución", icon: FileText },
    { id: 1, label: "Compañía", icon: Building },
    { id: 2, label: "Email", icon: Mail },
    { id: 3, label: "Placeholders", icon: Text },
    { id: 4, label: "Software", icon: Database },
    { id: 5, label: "Certificado", icon: FileText },
    { id: 6, label: "Actions", icon: Settings },
  ];

  // Verificar si existe una configuración al cargar el componente
  useEffect(() => {
    const verifyConfig = async () => {
      // El método checkConfigExists() ya maneja internamente el caso 404
      // y setea configExists a false cuando no encuentra configuración
      await checkConfigExists();
    };
    verifyConfig();
  }, [checkConfigExists]);

  // Preparar la configuración inicial basada en los datos de la organización
  useEffect(() => {
    if (!configExists) {
      // Obtener datos de la organización si están disponibles

      // Crear un objeto con valores por defecto para todos los campos requeridos
      const configFromOrg: IInvoiceConfig = {
        nextInvoiceNumber: "1",
        resolutionNumber: {
          type_document_id: "01",
          prefix: "FE",
          resolution: "0",
          resolution_date: new Date().toISOString().split("T")[0],
          from: "1",
          to: "1000",
          date_from: new Date().toISOString().split("T")[0],
          date_to: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          )
            .toISOString()
            .split("T")[0],
          technical_key: ""
        },
        placeholders: {
          paymentTerms: "30 días",
          currency: "COP",
          notes: "Gracias por su compra",
          logoImg: "https://via.placeholder.com/150",
          foot_note: "Pie de página predeterminado",
          head_note: "Encabezado predeterminado",
        },
        email: {
          mail_username: "ejemplo@empresa.com",
          mail_password: "",
          mail_host: "smtp.example.com",
          mail_port: 587,
          mail_encryption: "tls",
        },
        companyInfo: {
          email: "ejemplo@empresa.com",
          address: "Dirección de la empresa",
          phone: "3001234567",
          municipality_id: "112",
          type_document_identification_id: "31",
          type_organization_id: "1",
          type_regime_id: "48",
          type_liability_id: "O-13",
          business_name: "Nombre de la empresa",
          nit: "900123456",
          dv: "7",
        },
        software: {
          id: "",
          pin: "",
        },
        certificado: {
          certificate: "",
          password: "",
        },
        status: false
      };

      // Actualizar el store con la configuración preparada
      setInvoiceConfig(configFromOrg);
    }
  }, [setInvoiceConfig, configExists]);

  // Marcar cambios solo cuando la configuración existe y se ha modificado
  useEffect(() => {
    if (configExists) {
      setHasChanges(true);
    }
  }, [invoiceConfig, configExists]);

  const handleTabClick = (tabId: number) => {
    setActiveTab(tabId);
  };

  const handleSave = async () => {
    const success = await saveInvoiceConfig();
    if (success) {
      toast.show({
        title: "Configuración guardada",
        description:
          "La configuración de facturación se ha guardado correctamente.",
        type: "success",
      });
      setHasChanges(false);
    }
  };

  const handleCreateConfig = async () => {
    const success = await createInvoiceConfig();
    if (success) {
      toast.show({
        title: "Configuración creada",
        description: "Se ha creado una nueva configuración de facturación.",
        type: "success",
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <InvoiceResolution />;
      case 1:
        return <CompanyInfo />;
      case 2:
        return <EmailTemplates />;
      case 3:
        return <Placeholders />;
      case 4:
        return <Software />;
      case 5:
        return <Certificado />;
      case 6:
        return <Actions />;
      default:
        return null;
    }
  };

  // Vista de carga - Limitado a un tiempo máximo razonable

  // Efecto para evitar que la carga inicial se quede atascada
  useEffect(() => {
    if (isLoading) {
      // Si después de 5 segundos sigue cargando, asumimos que no hay configuración
      const timeout = setTimeout(() => {
        setInitialLoading(false);
      }, 5000);

      return () => clearTimeout(timeout);
    } else {
      setInitialLoading(false);
    }
  }, [isLoading]);

  // Solo mostramos la vista de carga durante la carga inicial
  if (initialLoading && isLoading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            Verificando configuración de facturación...
          </h2>
        </div>
      </div>
    );
  }

  // Vista para configuración inexistente
  if (!configExists && !initialLoading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4">
              <FileText className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              Configuración de Facturación
            </h2>
            <p className="text-gray-600 text-center mb-6">
              No se ha encontrado una configuración de facturación. Necesitas
              crear una para comenzar a generar facturas.
            </p>

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-red-800 font-medium">Error</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <Button
              onClick={handleCreateConfig}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear nueva configuración
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-8">
        Configuración de Facturación
      </h1>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="mb-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-0.5 rounded-lg shadow-xl">
        <div className="p-6 bg-white rounded-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-medium text-gray-900 flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${invoiceConfig.status ? "bg-green-500" : "bg-yellow-500"}`}></span>
              Estado Actual: <span className={`ml-1 ${invoiceConfig.status ? "text-green-600" : "text-yellow-600"}`}>
                {invoiceConfig.status ? "Producción" : "Desarrollo"}
              </span>
            </h3>
            <div className="mt-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Facturas generadas: 10/100
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${
                    invoiceConfig.status 
                      ? "bg-gradient-to-r from-green-400 to-green-500" 
                      : "bg-gradient-to-r from-yellow-400 to-yellow-500"
                  }`}
                  style={{
                    width: `${(30 / 100) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center align-middle justify-center bg-gray-100 rounded-lg p-4 shadow mb-4">
              <div className="text-sm text-gray-500 mb-1">
                Siguiente Nro Factura
              </div>
              <div className="font-semibold text-pink-600 ml-1 ">
                {invoiceConfig.nextInvoiceNumber || "342"}
              </div>
            </div>
            <ul className="space-y-2">
              <li>
                <a
                  href="/invoices"
                  className="flex items-center text-sm font-medium text-pink-600 hover:text-pink-800"
                >
                  <File className="w-4 h-4 mr-2" />
                  Factura Electrónica
                </a>
              </li>
              <li>
                <a
                  href="/notas-credito"
                  className="flex items-center text-sm font-medium text-pink-600 hover:text-pink-800"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Notas Crédito
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <nav className="flex space-x-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  ${
                    activeTab === tab.id
                      ? "border-indigo-300 text-indigo-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } 
                  flex items-center px-2 py-3 text-sm font-medium border-b-2 transition duration-150 ease-in-out
                `}
              >
                <tab.icon className="w-5 h-5 mr-2 text-gray-400" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isLoading}
          className="btn-primary flex items-center"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Cambios"
          )}
        </Button>
      </div>
    </div>
  );
}
