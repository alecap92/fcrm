import {
  ChevronRight,
  Search,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Modal } from "../ui/modal";
import fragmentsService from "../../services/fragmentsService";
import { useEffect, useState, useCallback } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useDebouncer } from "../../hooks/useDebbouncer";

interface QuickResponse {
  id: string;
  name: string;
  text: string;
}

interface QuickResponsesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
}

export function QuickResponses({
  isOpen,
  onClose,
  onSelect,
}: QuickResponsesProps) {
  const [quickResponses, setQuickResponses] = useState<QuickResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncer(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 5;

  const loadQuickResponses = useCallback(
    async (page: number = 1, search: string = "") => {
      try {
        setIsLoading(true);
        if (search) {
          const response: any = await fragmentsService.searchFragments(search);

          console.log(response, " response");
          setQuickResponses(response.data.fragments);
          setTotalPages(Math.ceil(response.data.total / itemsPerPage));
        } else {
          const response: any = await fragmentsService.getFragments(
            page,
            itemsPerPage
          );
          console.log(response, " response");
          setQuickResponses(response.data.fragments);
          setTotalPages(Math.ceil(response.data.total / itemsPerPage));
        }
      } catch (error) {
        console.error("Error loading quick responses:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      loadQuickResponses(currentPage, debouncedSearchTerm);
    }
  }, [isOpen, currentPage, debouncedSearchTerm, loadQuickResponses]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Respuestas rápidas">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar respuestas..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>

        {/* Quick Responses List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : quickResponses.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">No se encontraron respuestas</p>
            </div>
          ) : (
            quickResponses.map((response) => (
              <button
                key={response.id}
                className="w-full p-3 text-left rounded-lg hover:bg-gray-50 flex items-center justify-between"
                onClick={() => onSelect(response.text)}
              >
                <div>
                  <h4 className="font-medium text-gray-900">{response.name}</h4>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {response.text}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
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
}
