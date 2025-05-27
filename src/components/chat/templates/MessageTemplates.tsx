import {
  ChevronRight,
  Search,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Send,
} from "lucide-react";
import { Modal } from "../../ui/modal";
import templatesService from "../../../services/templatesService";
import { useEffect, useState, useCallback } from "react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useDebouncer } from "../../../hooks/useDebbouncer";

interface TemplateComponent {
  type: string;
  format?: string;
  text: string;
}

interface Template {
  id: string;
  name: string;
  parameter_format?: string;
  components: TemplateComponent[];
  language: string;
  status: string;
  category: string;
  text?: string; // Campo calculado para mostrar el texto del componente BODY
}

interface MessageTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateText: string) => void;
  phoneNumber?: string;
}

const MessageTemplates = ({
  isOpen,
  onClose,
  onSelect,
  phoneNumber,
}: MessageTemplatesProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncer(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const itemsPerPage = 5;

  const loadTemplates = useCallback(
    async (page: number = 1, search: string = "") => {
      try {
        setIsLoading(true);
        if (search) {
          const response: any = await templatesService.searchTemplates(search);
          // Procesar las plantillas de búsqueda para extraer el texto del componente BODY
          const processedSearchTemplates = response.data.templates.map(
            (template: Template) => ({
              ...template,
              text:
                template.components?.find((comp) => comp.type === "BODY")
                  ?.text ||
                template.components?.find((comp) => comp.type === "HEADER")
                  ?.text ||
                "Sin texto disponible",
            })
          );
          setTemplates(processedSearchTemplates);
          setTotalPages(Math.ceil(response.data.total / itemsPerPage));
        } else {
          const response: any = await templatesService.getTemplates(
            page,
            itemsPerPage
          );

          // Procesar las plantillas para extraer el texto del componente BODY
          const processedTemplates = response.data.data.map(
            (template: Template) => ({
              ...template,
              text:
                template.components?.find((comp) => comp.type === "BODY")
                  ?.text ||
                template.components?.find((comp) => comp.type === "HEADER")
                  ?.text ||
                "Sin texto disponible",
            })
          );

          setTemplates(processedTemplates);
        }
      } catch (error) {
        console.error("Error cargando plantillas:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Función helper para extraer el texto de la plantilla
  const getTemplateText = (template: Template): string => {
    return (
      template.text ||
      template.components?.find((comp) => comp.type === "BODY")?.text ||
      template.components?.find((comp) => comp.type === "HEADER")?.text ||
      "Sin texto disponible"
    );
  };

  useEffect(() => {
    if (isOpen) {
      loadTemplates(currentPage, debouncedSearchTerm);
    }
  }, [isOpen, currentPage, debouncedSearchTerm, loadTemplates]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    const templateText = getTemplateText(template);
    onSelect(templateText);
    onClose();
  };

  const handleSendTemplate = async (template: Template) => {
    if (!phoneNumber) return;

    try {
      setIsSending(true);
      const templateText = getTemplateText(template);

      // Crear un objeto ITemplate compatible desde el template de WhatsApp
      const templateForSending = {
        templateId: template.id,
        message: templateText,
        language: template.language, // Usar el language dinámico de la plantilla
        components: [] as [],
        name: template.name,
      };

      await templatesService.sendTemplate(templateForSending, phoneNumber);
      onClose();
    } catch (error) {
      console.error("Error enviando plantilla:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plantillas de mensajes">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar plantillas..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>

        {/* Templates List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">No se encontraron plantillas</p>
            </div>
          ) : (
            templates?.map((template) => (
              <div
                key={template.id}
                className="w-full p-3 rounded-lg hover:bg-gray-50 border"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  {phoneNumber ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendTemplate(template)}
                      disabled={isSending}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Enviar
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                      Seleccionar
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {getTemplateText(template)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <span className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MessageTemplates;
