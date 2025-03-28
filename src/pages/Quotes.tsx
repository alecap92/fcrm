import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Calendar,
  Building2,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  FileText,
  Trash2,
  Edit2,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import type { Quote } from "../types/quote";
import quotesService from "../services/quotesService";
import { useDebouncer } from "../hooks/useDebbouncer";

const dummy: Quote[] = [
  {
    _id: "1",
    quotationNumber: "QT-2024-001",
    expirationDate: "2024-04-20",
    name: "Cotización de Software",
    status: "sent",
    contactId: {
      firstName: "John",
      lastName: "Doe",
      companyName: "Acme Corp",
      email: "",
      mobile: "",
    },
    items: [
      {
        id: "1",
        description: "Software License",
        quantity: 1,
        unitPrice: 1000,
        discount: 0,
        tax: 160,
        total: 1160,
      },
    ],
    subtotal: 1000,
    discount: 0,
    taxes: 160,
    total: 1160,
    observaciones: "Thank you for your business",
    paymentTerms: "Net 30",
    shippingTerms: "FOB Destination",
    creationDate: "2024-03-20T10:00:00Z",
    lastModified: "2024-03-20T10:00:00Z",
    optionalItems: [],
    userId: "user-123",
  },
];

const getStatusColor = (status: Quote["status"]) => {
  switch (status) {
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "sent":
      return "bg-blue-100 text-blue-800";
    case "expired":
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [dummyQuotes, setDummyQuotes] = useState(dummy);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const debouncedSearch = useDebouncer(searchTerm, 500);

  const totalPages = 0;

  const lodaQuotes = async () => {
    const response = await quotesService.getQuotes(currentPage, itemsPerPage);
    setDummyQuotes(response.quotations);
    console.log(response.quotations);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedQuotes(dummyQuotes.map((quote) => quote._id));
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
    console.log("Searching for quotes with term:", debouncedSearch);
    const response = await quotesService.searchQuotes(debouncedSearch);

    setDummyQuotes(response.quotations);
    console.log(response.quotations);
  };

  useEffect(() => {
    if (debouncedSearch) {
      searchQuotes();
    } else {
      lodaQuotes();
    }
  }, [debouncedSearch]);

  useEffect(() => {
    lodaQuotes();
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-action focus:ring-action"
                      checked={selectedQuotes.length === dummyQuotes.length}
                      onChange={handleSelectAll}
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
                {dummyQuotes.map((quote) => (
                  <tr key={quote._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-action focus:ring-action"
                        checked={selectedQuotes.includes(quote._id)}
                        onChange={() => handleSelectQuote(quote._id)}
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
                          {quote.contactId.companyName ||
                            quote.contactId.firstName}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-4 h-4 mr-1" />
                          {quote.contactId.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-1" />
                          {quote.contactId.mobile}
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
                          onClick={() => handleEditQuote(quote._id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                className="ml-2 rounded-md border-gray-300 text-sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  console.log(e.target.value);
                }}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
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
                Previous
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
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
