import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Calendar,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  FileText,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Building2,
  Printer,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import type { Quote } from "../types/quote";
import quotesService from "../services/quotesService";
import { useDebouncer } from "../hooks/useDebbouncer";
import { useLoading } from "../contexts/LoadingContext";
import { useToast } from "../components/ui/toast";

const getStatusColor = (status: Quote["status"]) => {
  switch (status) {
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "sent":
      return "bg-blue-100 text-blue-800";
    case "draft":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const getStatusIcon = (status: Quote["status"]) => {
  switch (status) {
    case "accepted":
      return <CheckCircle2 className="w-4 h-4" />;
    case "rejected":
      return <XCircle className="w-4 h-4" />;
    case "sent":
      return <Send className="w-4 h-4" />;
    case "expired":
      return <Clock className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

export function Quotes() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    quoteId: string;
    quoteName: string;
  }>({
    isOpen: false,
    quoteId: "",
    quoteName: "",
  });
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);

  const debouncedSearch = useDebouncer(searchTerm, 500);
  const toast = useToast();

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const response = await quotesService.getQuotes(currentPage, itemsPerPage);
      setQuotes(response.data.quotations || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("Error loading quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedQuotes(quotes.map((quote) => quote._id as string));
    } else {
      setSelectedQuotes([]);
    }
  };

  const handleSelectQuote = (quoteId: string) => {
    setSelectedQuotes((current) =>
      current.includes(quoteId)
        ? current.filter((id) => id !== quoteId)
        : [...current, quoteId]
    );
  };

  const handleEditQuote = (quoteId: string) => {
    navigate(`/quotes/${quoteId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedQuotes([]); // Clear selections when changing pages
  };

  const searchQuotes = async () => {
    try {
      setLoading(true);
      const response = await quotesService.searchQuotes(debouncedSearch);
      setQuotes(response.data.quotations || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("Error searching quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async (quoteId: string) => {
    try {
      showLoading("Generando PDF de la cotización...");
      const response = await quotesService.printQuote(quoteId);

      const blob = await response.data;
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `cotizacion_${quoteId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      hideLoading();
    }
  };

  const confirmDelete = (quoteId: string, quoteName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      quoteId,
      quoteName: quoteName || "esta cotización",
    });
  };

  const confirmBulkDelete = () => {
    if (selectedQuotes.length > 0) {
      setBulkDeleteConfirmation(true);
    }
  };

  const handleDelete = async (quoteId: string) => {
    try {
      showLoading("Eliminando cotización...");
      await quotesService.deleteQuote(quoteId);
      setQuotes((prev) => prev.filter((quote) => quote._id !== quoteId));
    } catch (error) {
      console.error("Error deleting quote:", error);
    } finally {
      hideLoading();
      setDeleteConfirmation({ isOpen: false, quoteId: "", quoteName: "" });
    }
  };

  const handleBulkDelete = async () => {
    try {
      showLoading(`Eliminando ${selectedQuotes.length} cotizaciones...`);
      // Implement bulk delete logic here
      // For now, we'll delete one by one
      for (const quoteId of selectedQuotes) {
        await quotesService.deleteQuote(quoteId);
      }
      setQuotes((prev) => 
        prev.filter((quote) => !selectedQuotes.includes(quote._id as string))
      );
      setSelectedQuotes([]);
    } catch (error) {
      console.error("Error deleting quotes:", error);
    } finally {
      hideLoading();
      setBulkDeleteConfirmation(false);
    }
  };

  const handleSendQuote = async (quoteNumber: string, email: string) => {
    try {
      showLoading("Enviando cotización...");

      if (!email) {
        toast.show({
          title: "Error",
          description: "No se puede enviar la cotización sin un correo válido",
          type: "error",
        });
        return;
      }

      if(!quoteNumber) {
        toast.show({
          title: "Error",
          description: "No se puede enviar la cotización sin un número de cotización",
          type: "error",
        });
        return;
      }

      await quotesService.sendQuote({
        quotationNumber: quoteNumber,
        to: email, 
        subject: "Cotización de manillas",
        templateId: "2",
        from: "ventas@manillasdecontrol.com",
      });
    } catch (error) {
      console.error("Error sending quote:", error);
    } finally { 
      hideLoading();
    }
  };

  useEffect(() => {
    if (debouncedSearch) {
      searchQuotes();
    } else {
      loadQuotes();
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadQuotes();
  }, [currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Cotizaciones
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona tus cotizaciones y propuestas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={() => navigate("/quotes/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cotización
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar cotizaciones..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant={isFilterOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow">
          {selectedQuotes.length > 0 && (
            <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {selectedQuotes.length} cotización(es) seleccionada(s)
              </span>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={confirmBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar seleccionados
              </Button>
            </div>
          )}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-action animate-spin mb-4" />
                <p className="text-gray-500 text-lg">Cargando cotizaciones...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-action focus:ring-action"
                        checked={selectedQuotes.length === quotes.length && quotes.length > 0}
                        onChange={handleSelectAll}
                        disabled={quotes.length === 0}
                      />
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 bg-gray-50"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg mb-2">No se encontraron cotizaciones</p>
                        <p className="text-gray-400 text-sm mb-4">Crea una nueva cotización para comenzar</p>
                        <Button onClick={() => navigate("/quotes/new")}>
                          <Plus className="w-4 h-4 mr-2" />
                          Nueva Cotización
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    quotes.map((quote) => (
                      <tr key={quote._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-action focus:ring-action"
                            checked={selectedQuotes.includes(quote._id as string)}
                            onChange={() => handleSelectQuote(quote._id as string)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {quote.quotationNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center text-sm font-medium text-gray-900">
                              <Building2 className="w-4 h-4 mr-1 text-gray-400" />
                              {quote?.contactId?.companyName ||
                                quote?.contactId?.firstName ||
                                quote?.contact?.firstName ||
                                "Sin nombre"}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="w-4 h-4 mr-1" />
                              {quote?.contactId?.email || 
                               quote?.contact?.email || 
                               "Sin correo"}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="w-4 h-4 mr-1" />
                              {quote?.contactId?.mobile || 
                               quote?.contact?.mobile || 
                               quote?.contact?.phone || 
                               ""}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {quote?.creationDate &&
                                format(new Date(quote.creationDate), "MMM d, yyyy")}
                            </div>
                            <span className="text-xs">
                              Expira:{" "}
                              {format(
                                new Date(quote.expirationDate),
                                "MMM d, yyyy"
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            ${quote.total.toLocaleString()}
                          </span>
                          {quote.discount > 0 && (
                            <div className="text-xs text-green-600">
                              -{quote.discount.toLocaleString()} descuento
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`
                            inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${getStatusColor(quote.status)}
                          `}
                          >
                            {getStatusIcon(quote.status)}
                            {quote.status.charAt(0).toUpperCase() +
                              quote.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuote(quote._id as string)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => confirmDelete(
                                quote._id as string, 
                                quote.name || quote.quotationNumber
                              )}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handlePrint(quote.quotationNumber as string)
                              }
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleSendQuote(quote.quotationNumber, quote.contactId.email)
                              }
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          {/* Pagination */}
          {!loading && quotes.length > 0 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  className="ml-2 rounded-md border-gray-300 text-sm"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="min-w-[2.5rem]"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Eliminar cotización
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar {deleteConfirmation.quoteName}? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmation({ isOpen: false, quoteId: "", quoteName: "" })}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirmation.quoteId)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Eliminar cotizaciones
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar {selectedQuotes.length} cotización(es)? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setBulkDeleteConfirmation(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}