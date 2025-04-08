import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import type { Invoice } from "../types/invoice";
import invoiceService from "../services/invoiceService";
import { useToast } from "../components/ui/toast";
import { useDebouncer } from "../hooks/useDebbouncer";
import { useAuth } from "../contexts/AuthContext";
import InvoiceConfiguration from "./InvoiceConfiguration";

const getStatusColor = (status: Invoice["status"]) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "sent":
      return "bg-blue-100 text-blue-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const getStatusIcon = (status: Invoice["status"]) => {
  switch (status) {
    case "paid":
      return <CheckCircle2 className="w-4 h-4" />;
    case "sent":
      return <Send className="w-4 h-4" />;
    case "overdue":
      return <Clock className="w-4 h-4" />;
    case "cancelled":
      return <XCircle className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

export function Invoices() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);

  const debouncedSearch = useDebouncer(searchTerm, 500);
  const { organization } = useAuth();

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await invoiceService.getInvoices(
        currentPage,
        itemsPerPage
      );
      console.log(response);
      // Ensure response data exists before updating state
      if (response) {
        setInvoices(response.invoices);
        setTotalPages(response.totalPages || 1);
        setTotalInvoices(response.totalInvoices || 0);
      } else {
        setInvoices([]);
        setTotalPages(1);
        setTotalInvoices(0);
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.show({
        title: "Error",
        description: "Failed to load invoices",
        type: "error",
      });
      // Set default values on error
      setInvoices([]);
      setTotalPages(1);
      setTotalInvoices(0);
    } finally {
      setIsLoading(false);
    }
  };

  const searchInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await invoiceService.searchInvoices(debouncedSearch);

      // Ensure response data exists before updating state
      if (response?.invoices) {
        setInvoices(response.invoices);
        setTotalPages(response.totalPages || 1);
        setTotalInvoices(response.totalInvoices || 0);
      } else {
        setInvoices([]);
        setTotalPages(1);
        setTotalInvoices(0);
      }
    } catch (error) {
      console.error("Error searching invoices:", error);
      toast.show({
        title: "Error",
        description: "Failed to search invoices",
        type: "error",
      });
      // Set default values on error
      setInvoices([]);
      setTotalPages(1);
      setTotalInvoices(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch) {
      searchInvoices();
    } else {
      loadInvoices();
    }
  }, [debouncedSearch, currentPage, itemsPerPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoices(invoices.map((invoice) => invoice._id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices((current) =>
      current.includes(invoiceId)
        ? current.filter((id) => id !== invoiceId)
        : [...current, invoiceId]
    );
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      await invoiceService.deleteInvoice(id);
      toast.show({
        title: "Success",
        description: "Invoice deleted successfully",
        type: "success",
      });
      loadInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.show({
        title: "Error",
        description: "Failed to delete invoice",
        type: "error",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await invoiceService.bulkDeleteInvoices(selectedInvoices);
      toast.show({
        title: "Success",
        description: "Selected invoices deleted successfully",
        type: "success",
      });
      setSelectedInvoices([]);
      loadInvoices();
    } catch (error) {
      console.error("Error deleting invoices:", error);
      toast.show({
        title: "Error",
        description: "Failed to delete selected invoices",
        type: "error",
      });
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await invoiceService.markAsPaid(id, {
        method: "bank_transfer",
        date: new Date().toISOString(),
        amount: invoices.find((inv) => inv._id === id)?.total || 0,
      });
      toast.show({
        title: "Success",
        description: "Invoice marked as paid",
        type: "success",
      });
      loadInvoices();
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast.show({
        title: "Error",
        description: "Failed to mark invoice as paid",
        type: "error",
      });
    }
  };

  const handleSendInvoice = async (id: string, email: string) => {
    try {
      await invoiceService.sendInvoice(id, {
        to: email,
        subject: "Your Invoice",
        message: "Please find your invoice attached.",
      });
      toast.show({
        title: "Success",
        description: "Invoice sent successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.show({
        title: "Error",
        description: "Failed to send invoice",
        type: "error",
      });
    }
  };

  const handleDownloadInvoice = async (id: string) => {
    try {
      await invoiceService.downloadInvoice(id);
      toast.show({
        title: "Success",
        description: "Invoice downloaded successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.show({
        title: "Error",
        description: "Failed to download invoice",
        type: "error",
      });
    }
  };

  if (!organization.settings.invoiceSettings) {
    console.log("No invoice settings found, showing configuration");
    return <InvoiceConfiguration />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Facturas</h1>
              <p className="mt-1 text-sm text-gray-500">
                {totalInvoices} facturas en total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={() => navigate("/invoices/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Factura
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar facturas..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant={isFilterOpen ? "default" : "outline"}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {isFilterOpen && (
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select className="rounded-lg border-gray-300">
                  <option>Todos los estados</option>
                  <option>Pagada</option>
                  <option>Enviada</option>
                  <option>Vencida</option>
                  <option>Cancelada</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="rounded-lg border-gray-300"
                    placeholder="Fecha inicio"
                  />
                  <input
                    type="date"
                    className="rounded-lg border-gray-300"
                    placeholder="Fecha fin"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    className="rounded-lg border-gray-300"
                    placeholder="Monto mínimo"
                  />
                  <input
                    type="number"
                    className="rounded-lg border-gray-300"
                    placeholder="Monto máximo"
                  />
                </div>
              </div>
            </div>
          )}
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
                      checked={
                        selectedInvoices.length === (invoices?.length || 0)
                      }
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
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : !invoices?.length ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No se encontraron facturas
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-action focus:ring-action"
                          checked={selectedInvoices.includes(invoice._id)}
                          onChange={() => handleSelectInvoice(invoice._id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {invoice.number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <Building2 className="w-4 h-4 mr-1 text-gray-400" />
                            {invoice.customer.firstName}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="w-4 h-4 mr-1" />
                            {invoice.customer.email}
                          </div>
                          {invoice.customer.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="w-4 h-4 mr-1" />
                              {invoice.customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {format(new Date(invoice.date), "dd/MM/yyyy")}
                          </div>
                          <span className="text-xs">
                            Vence:{" "}
                            {format(new Date(invoice.dueDate), "dd/MM/yyyy")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          ${invoice.total.toLocaleString()}
                        </span>
                        {invoice.discount > 0 && (
                          <div className="text-xs text-green-600">
                            -{invoice.discount.toLocaleString()} descuento
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`
                          inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${getStatusColor(invoice.status)}
                        `}
                        >
                          {getStatusIcon(invoice.status)}
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/invoices/${invoice._id}`)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteInvoice(invoice._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                className="rounded-md border-gray-300 text-sm"
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
              <span className="text-sm text-gray-500">
                Mostrando{" "}
                {Math.min((currentPage - 1) * itemsPerPage + 1, totalInvoices)}{" "}
                a {Math.min(currentPage * itemsPerPage, totalInvoices)} de{" "}
                {totalInvoices} facturas
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages || 0 }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="min-w-[2.5rem]"
                      onClick={() => setCurrentPage(page)}
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
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
