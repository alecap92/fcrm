import { X } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import formuAppService from "../../services/formuAppService";
import { useLoading } from "../../contexts/LoadingContext";
import integrationService from "../../services/integrationService";

interface TemplateKey {
  label: string;
  key: string;
  type: string;
  required: boolean;
  options: string;
}

interface TemplateEtapa {
  label: string;
  key: TemplateKey[];
  isOpen: boolean;
}

interface Template {
  _id: string;
  name: string;
  category: string;
  fileName: string;
  fileUrl: string;
  fileId: string;
  isPublic: boolean;
  userId: string;
  etapas: TemplateEtapa[];
  createdAt: string;
  updatedAt: string;
  apiVisibility: boolean;
}

interface ContactProperty {
  key: string;
  value: string;
}

interface Contact {
  properties: ContactProperty[];
}

interface PrintModalProps {
  contact: any;
  onClose: () => void;
}

const PrintModal = ({ contact, onClose }: PrintModalProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");

  const { showLoading, hideLoading } = useLoading();

  const formatData = (fileEtapas: TemplateEtapa[], contact: Contact) => {
    return fileEtapas.reduce((data: Record<string, string>, etapa) => {
      etapa.key.forEach((keyItem) => {
        const contactProperty = contact.properties.find(
          (property) => property.key === keyItem.key
        );

        if (contactProperty) {
          data[`${etapa.label}.${keyItem.key}?`] = contactProperty.value;
        }
      });

      return data;
    }, {});
  };

  const printHandler = async (formId: string) => {
    try {
      showLoading("Generando PDF...");
      const template = await formuAppService.getFile(formId, apiKey);
      const formattedData = formatData(template.etapas, contact);
      const pdfBlob = await formuAppService.getPDFFile(
        formId,
        formattedData,
        apiKey
      );

      const url = window.URL.createObjectURL(pdfBlob);
      const newWindow = window.open(url);

      if (newWindow) {
        newWindow.addEventListener("load", () => {
          newWindow.print();
        });
      }

      onClose();
    } catch (error) {
      console.error("Error al imprimir el PDF:", error);
    } finally {
      hideLoading();
    }
  };

  const initIntegrationAndFiles = async () => {
    setLoading(true);
    try {
      const integration = await integrationService.getIntegrations();

      const formuappData = integration.data?.find(
        (item: any) => item.service === "formuapp"
      );

      const key = formuappData?.credentials?.apiKey;

      if (!key) {
        console.warn("No se encontró una API key válida de FormuApp.");
        return;
      }

      setApiKey(key); // para que el resto del componente también lo tenga

      const files = await formuAppService.getTemplates(key); // ✅ usar directamente el valor
      setTemplates(files);
    } catch (error) {
      console.error("Error al obtener la integración o las plantillas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initIntegrationAndFiles();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Impresión de plantillas con FormuApp
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6"></div>
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3 pb-4">
              {[1].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : templates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nombre
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr key={template._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {template._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {template.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          size="sm"
                          onClick={() => printHandler(template._id)}
                        >
                          Imprimir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Para utilizar este servicio, debes configurar la API de FormuApp
              version 2 o superior.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintModal;
