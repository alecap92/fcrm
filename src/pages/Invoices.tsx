import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Calendar,
  Building2,
  Mail,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileDown,
  FileCode,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import invoiceService from "../services/invoiceService";
import { useToast } from "../components/ui/toast";
import { useDebouncer } from "../hooks/useDebbouncer";
import { ComposeEmail } from "../components/email/ComposeEmail";


export function Invoices() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [invoices, setInvoices] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [selectedInvoiceForEmail, setSelectedInvoiceForEmail] = useState<any>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});


  const debouncedSearch = useDebouncer(searchTerm, 500);


  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const response:any = await invoiceService.getInvoices(
        currentPage,
        itemsPerPage
      );



      // Ensure response data exists before updating state
      if (response && response.data) {
        // Combinar todos los documentos de diferentes tipos en un solo array
        const allDocuments = [];
        for (const category of response.data.data) {
          for (const doc of category.documents) {
            // Añadir el tipo de documento a cada documento
            allDocuments.push({
              ...doc,
              documentType: category.name
            });
          }
        }
        
        setInvoices(allDocuments);
        setTotalPages(response.totalPages || 1);
        setTotalInvoices(response.totalInvoices || allDocuments.length || 0);
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

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId]?.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoices(invoices.map((invoice: any) => invoice._id || invoice.id));
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

  

  const getIsValid = (invoice: any) => {
    try {
      if (invoice.response_dian) {
        const responseDian = typeof invoice.response_dian === 'string' 
          ? JSON.parse(invoice.response_dian) 
          : invoice.response_dian;
        
        return responseDian?.Envelope?.Body?.SendBillSyncResponse?.SendBillSyncResult?.IsValid === "true" 
          ? "Válido" 
          : "No válido";
      }
      return "Pendiente";
    } catch (error) {
      console.error("Error parsing response_dian:", error);
      return "Error";
    }
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleDownloadPDF = (invoice: any) => {
    // Lógica para descargar PDF
    if (invoice.pdf) {
      const pdfUrl = `http://148.113.175.139/api/invoice/900694948/FES-${invoice.prefix}${invoice.number}.pdf`;
      window.open(pdfUrl, '_blank');
    } else {
      toast.show({
        title: "Error",
        description: "PDF no disponible",
        type: "error",
      });
    }
    setOpenMenuId(null);
  };

  const handleDownloadXML = (invoice: any) => {
    // Lógica para descargar XML
    if (invoice.xml) {
      const xmlUrl = `http://148.113.175.139/api/invoice/900694948/FES-${invoice.prefix}${invoice.number}.xml`;
      window.open(xmlUrl, '_blank');
    } else {
      toast.show({
        title: "Error",
        description: "XML no disponible",
        type: "error",
      });
    }
    setOpenMenuId(null);
  };

  const handleCreateCreditNote = (invoice: any) => {
    // Redirigir a la página para crear una nota de crédito
    navigate(`/invoices/credit-note/new?reference=${invoice.id || invoice._id}`);
    setOpenMenuId(null);
  };

  const handleSendEmail = async (invoice: any, form?: {to: string[], subject: string, content: string}) => {
    try {
      if (!invoice) {
        throw new Error("No se ha seleccionado ninguna factura");
      }
      
      if (form) {
  

        await invoiceService.sendEmail({
          number: invoice.number,
          prefix: invoice.prefix, 
          to: form.to,
          subject: form.subject,
          content: form.content,
          idNumber: invoice.identification_number
        });
        
        setIsEmailOpen(false);
        setSelectedInvoiceForEmail(null);
        
        toast.show({
          title: "Correo enviado",
          description: "Correo enviado correctamente",
          type: "success",
        });
      } else {
        // Abrir modal de correo y establecer la factura seleccionada
        setSelectedInvoiceForEmail(invoice);
        setIsEmailOpen(true);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.show({
        title: "Error",
        description: "Error al enviar el correo",
        type: "error",
      });
    }
  };

  

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Facturas</h1>
              <p className="mt-1 text-sm text-gray-500">
                {totalInvoices} documentos en total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/notas-credito")}>
                <CreditCard className="w-4 h-4 mr-2" />
                Notas de Crédito
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
                        selectedInvoices.length === (invoices?.length || 0) && invoices.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
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
                    <td colSpan={8} className="px-6 py-4 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : !invoices?.length ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No se encontraron documentos
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice:any) => (
                    <tr key={invoice.id || invoice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-action focus:ring-action"
                          checked={selectedInvoices.includes(invoice.id || invoice._id)}
                          onChange={() => handleSelectInvoice(invoice.id || invoice._id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {invoice.documentType || invoice.type_document?.name || "Factura"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {invoice.prefix}{invoice.number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <Building2 className="w-4 h-4 mr-1 text-gray-400" />
                            {invoice.client.name}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="w-4 h-4 mr-1" />
                            {invoice.client.phone}
                          </div>
                        
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {format(new Date(invoice.created_at), "dd/MM/yyyy")}
                          </div>
                         
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          ${invoice.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          getIsValid(invoice) === "Válido" 
                            ? "bg-green-100 text-green-800" 
                            : getIsValid(invoice) === "No válido" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {getIsValid(invoice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 relative">
                        
                         
                          <div className="relative" ref={el => menuRefs.current[invoice.id || invoice._id] = el}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleMenu(invoice.id || invoice._id)}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            
                            {openMenuId === (invoice.id || invoice._id) && (
                              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
                                <div className="py-1">
                                  <button
                                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                                    onClick={() => handleDownloadPDF(invoice)}
                                  >
                                    <FileDown className="w-4 h-4 mr-2" />
                                    Descargar PDF
                                  </button>
                                  <button
                                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                                    onClick={() => handleDownloadXML(invoice)}
                                  >
                                    <FileCode className="w-4 h-4 mr-2" />
                                    Descargar XML
                                  </button>
                                  <button
                                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                                    onClick={() => handleCreateCreditNote(invoice)}
                                  >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Crear Nota Crédito
                                  </button>
                                  <button
                                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                                    onClick={() => handleSendEmail(invoice)}
                                  >
                                    <Mail className="w-4 h-4 mr-2" />
                                   Enviar por correo
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
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
                {totalInvoices} documentos
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
      {
        isEmailOpen && (
          <ComposeEmail 
            onClose={() => {
              setIsEmailOpen(false);
              setSelectedInvoiceForEmail(null);
            }} 
            handleSendEmail={handleSendEmail}
            selectedInvoice={selectedInvoiceForEmail}
          />
        )
      }
    </div>
  );
}
