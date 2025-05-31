import React, { useState, useEffect } from "react";
import { Search, X, DollarSign, Calendar, User, Building } from "lucide-react";
import { Button } from "../ui/button";
import { useDebouncer } from "../../hooks/useDebbouncer";
import { Deal } from "../../types/deal";
import { format } from "date-fns";

interface SearchDealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (query: string) => Promise<void>;
  searchResults: Deal[];
  onDealClick: (deal: Deal) => void;
}

export function SearchDealsModal({
  isOpen,
  onClose,
  onSubmit,
  searchResults,
  onDealClick,
}: SearchDealsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState("");

  const debouncedSearchQuery = useDebouncer(searchQuery, 300);

  useEffect(() => {
    const performSearch = async () => {
      if (
        !debouncedSearchQuery.trim() ||
        debouncedSearchQuery === lastSearchQuery
      ) {
        return;
      }

      console.log("🔍 Realizando búsqueda:", debouncedSearchQuery);
      setIsSearching(true);
      setLastSearchQuery(debouncedSearchQuery);

      try {
        await onSubmit(debouncedSearchQuery);
      } catch (error) {
        console.error("Error searching deals:", error);
      } finally {
        setIsSearching(false);
      }
    };

    if (debouncedSearchQuery.trim()) {
      performSearch();
    }
  }, [debouncedSearchQuery, onSubmit]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setLastSearchQuery("");
      setIsSearching(false);
    }
  }, [isOpen]);

  const handleDealClick = (deal: Deal) => {
    onDealClick(deal);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Buscar Negocios
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, contacto, empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Buscando...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {searchResults.map((deal) => (
                <div
                  key={deal._id}
                  onClick={() => handleDealClick(deal)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <h3 className="font-medium text-gray-900">
                          {deal.title}
                        </h3>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatCurrency(deal.amount)}</span>
                        </div>

                        {deal.closingDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Cierre:{" "}
                              {format(new Date(deal.closingDate), "dd/MM/yyyy")}
                            </span>
                          </div>
                        )}

                        {deal.associatedContactId && (
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span>
                              {deal.associatedContactId.properties?.name ||
                                deal.associatedContactId.properties
                                  ?.firstName ||
                                "Contacto asignado"}
                            </span>
                          </div>
                        )}

                        {deal.status && (
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: deal.status.color || "#6B7280",
                              }}
                            />
                            <span>{deal.status.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Search className="h-8 w-8 mb-2" />
              <p>No se encontraron negocios</p>
              <p className="text-sm">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Search className="h-8 w-8 mb-2" />
              <p>Escribe para buscar negocios</p>
              <p className="text-sm">Busca por nombre, contacto o empresa</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
