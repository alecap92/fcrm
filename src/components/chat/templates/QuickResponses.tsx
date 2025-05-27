import {
  ChevronRight,
  Search,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Modal } from "../../ui/modal";
import fragmentsService from "../../../services/fragmentsService";
import { useEffect, useState, useCallback } from "react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useDebouncer } from "../../../hooks/useDebbouncer";

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
  const [totalFragments, setTotalFragments] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 5;

  const loadQuickResponses = useCallback(
    async (page: number = 1, search: string = "") => {
      try {
        setIsLoading(true);
        if (search) {
          const response: any = await fragmentsService.searchFragments(
            search,
            page,
            itemsPerPage
          );

          console.log("Search response:", response.data);
          setQuickResponses(response.data.fragments);
          setTotalPages(response.data.totalPages);
          setCurrentPage(response.data.currentPage);
          setTotalFragments(response.data.totalFragments);
        } else {
          const response: any = await fragmentsService.getFragments(
            page,
            itemsPerPage
          );
          console.log("Get fragments response:", response.data);
          setQuickResponses(response.data.fragments);
          setTotalPages(response.data.totalPages);
          setCurrentPage(response.data.currentPage);
          setTotalFragments(response.data.totalFragments);
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
        {quickResponses.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-1">
                {/* Primera página */}

                {/* Página anterior */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Números de página */}
                <div className="flex items-center space-x-1">
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(
                      1,
                      currentPage - Math.floor(maxVisiblePages / 2)
                    );
                    let endPage = Math.min(
                      totalPages,
                      startPage + maxVisiblePages - 1
                    );

                    // Ajustar el inicio si estamos cerca del final
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    // Mostrar primera página y puntos suspensivos si es necesario
                    if (startPage > 1) {
                      pages.push(
                        <Button
                          key={1}
                          variant={1 === currentPage ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          className="px-3"
                        >
                          1
                        </Button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span
                            key="start-ellipsis"
                            className="px-2 text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }
                    }

                    // Páginas visibles
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={i === currentPage ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handlePageChange(i)}
                          className="px-3"
                        >
                          {i}
                        </Button>
                      );
                    }

                    // Mostrar última página y puntos suspensivos si es necesario
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span
                            key="end-ellipsis"
                            className="px-2 text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <Button
                          key={totalPages}
                          variant={
                            totalPages === currentPage ? "default" : "ghost"
                          }
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          className="px-3"
                        >
                          {totalPages}
                        </Button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                {/* Página siguiente */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
