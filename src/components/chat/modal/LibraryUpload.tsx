import {
  ChevronRight,
  Search,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  FileText,
  Image,
} from "lucide-react";
import { Modal } from "../../ui/modal";
import { useEffect, useState, useCallback } from "react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useDebouncer } from "../../../hooks/useDebbouncer";
import fileService from "../../../services/filesService";
import type { FileDocument } from "../../../services/filesService";

interface LibraryUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (document: FileDocument) => void;
}

export function LibraryUpload({
  isOpen,
  onClose,
  onSelect,
}: LibraryUploadProps) {
  const [documents, setDocuments] = useState<FileDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncer(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fileService.getFiles({ isVisible: true });
      console.log(response, "response");
      setDocuments(response);
      setTotalPages(Math.ceil(response.length / itemsPerPage));
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen, loadDocuments]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getFileIcon = (type: string) => {
    if (type === "image") {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Biblioteca de archivos"
      modalSize="XL"
    >
      <div className="space-y-4">
        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar archivos..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>

        {/* Lista de documentos */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : paginatedDocuments.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">No se encontraron archivos</p>
            </div>
          ) : (
            paginatedDocuments.map((document) => (
              <button
                key={document._id}
                className="w-full p-3 text-left rounded-lg hover:bg-gray-50 flex items-center justify-between"
                onClick={() => onSelect(document)}
              >
                <div className="flex items-center gap-3">
                  {document.fileType === "image" ? (
                    <div className="w-10 h-10 rounded-md overflow-hidden">
                      <img
                        src={document.mediaURL}
                        alt={document.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    getFileIcon(document.fileType)
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {document.name}
                    </h4>
                    <p className="text-sm text-gray-500">{document.fileType}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))
          )}
        </div>

        {/* Paginación */}
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
}
