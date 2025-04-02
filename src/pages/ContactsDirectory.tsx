import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  Tags,
  Download,
  Upload,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { contactsService } from "../services/contactsService";
import { useToast } from "../components/ui/toast";
import type {
  Contact,
  ContactFilters,
  FilterCondition,
  PaginationParams,
} from "../types/contact";
import { useDebouncer } from "../hooks/useDebbouncer";
import AddContact from "../components/contacts/AddContact";
import { useNavigate } from "react-router-dom";
import FiltersModal from "../components/contacts/FiltersModal";
import { ActiveFilters } from "../components/contacts/ActiveFilters";
import { normalizeContact } from "../lib/parseContacts";

export function ContactsDirectory() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ContactFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10,
  });
  const [totalContacts, setTotalContacts] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterCondition[]>([]);
  const navigate = useNavigate();

  const toast = useToast();

  const debouncedSearch = useDebouncer(searchTerm, 500);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await contactsService.getContacts(pagination);

      setContacts(response.data.data.map(normalizeContact));
      setTotalContacts(response.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading contacts");
      toast.show({
        title: "Error",
        description: "Failed to load contacts",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await contactsService.searchContacts(debouncedSearch);

      setContacts(response.data.map(normalizeContact));
      setTotalContacts(response.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error searching contacts");
      toast.show({
        title: "Error",
        description: "Failed to search contacts",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch && debouncedSearch.trim() !== "") {
      searchContacts();
    } else {
      loadContacts();
    }
  }, [debouncedSearch, pagination.page, pagination.limit, filters]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedContacts(contacts.map((contact) => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts((current) =>
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId]
    );
  };

  const handleCreateContact = async (contactData: any) => {
    try {
      setIsLoading(true);
      if (
        !contactData.firstName ||
        !contactData.companyType ||
        !contactData.mobile
      ) {
        toast.show({
          title: "Error",
          description: "Faltan campos obligatorios",
          type: "error",
        });
        return;
      }

      console.log("Contact data:", contactData.firstName);

      await contactsService.createContact(contactData);
      toast.show({
        title: "Success",
        description: "Contact created successfully",
        type: "success",
      });
      setShowCreateModal(false);

      loadContacts();
    } catch (err) {
      toast.show({
        title: "Error",
        description: "Failed to create contact",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = async (filters: FilterCondition[]) => {
    setActiveFilters(filters);

    const response = await contactsService.filterContacts(filters);

    setContacts(response.data.map(normalizeContact));
  };

  const handleRemoveFilter = (id: string) => {
    setActiveFilters((current) => current.filter((filter) => filter.id !== id));
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
    loadContacts();
  };

  const handleDeleteContacts = async () => {
    try {
      await contactsService.bulkDeleteContacts(selectedContacts);
      toast.show({
        title: "Success",
        description: "Contacts deleted successfully",
        type: "success",
      });
      setSelectedContacts([]);
      loadContacts();
    } catch (err) {
      toast.show({
        title: "Error",
        description: "Failed to delete contacts",
        type: "error",
      });
    }
    setShowDeleteDialog(false);
  };

  const handleViewContact = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Error loading contacts
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadContacts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Directorio de Contactos
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {totalContacts} contactos en total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Contacto
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar contactos..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-4">
              <ActiveFilters
                filters={activeFilters}
                onRemove={handleRemoveFilter}
                onClearAll={handleClearFilters}
              />
            </div>
          )}

          {showFilters && (
            <FiltersModal
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              onApply={handleApplyFilters}
              activeFilters={activeFilters}
            />
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
                      checked={selectedContacts.length === contacts.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Etiquetas
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No se encontraron contactos
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-action focus:ring-action"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => handleSelectContact(contact.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <button
                            className="hover:underline"
                            onClick={() => handleViewContact(contact.id)}
                          >
                            {contact.firstName} {contact.lastName}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="w-4 h-4 mr-1" />
                            {contact.email}
                          </div>
                          {contact.mobile && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="w-4 h-4 mr-1" />
                              {contact.mobile}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {contact.companyName && (
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                            <div className="text-sm text-gray-900">
                              {contact.companyName}
                            </div>
                          </div>
                        )}
                        {contact.address && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {[
                              contact.address.street,
                              contact.address.city,
                              contact.address.state,
                              contact.address.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              contact.companyType === "Sin tipo de empresa"
                                ? "bg-red-100 text-yellow-800"
                                : "bg-yellow-100 bg-red-100 text-red-800"
                            }`}
                          >
                            <Tags className="w-3 h-3 mr-1" />
                            {contact.companyType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedContacts([contact.id]);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
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
          {totalContacts > 0 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                {Math.min(pagination.page * pagination.limit, totalContacts)} de{" "}
                {totalContacts} contactos
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page * pagination.limit >= totalContacts}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Eliminar{" "}
              {selectedContacts.length === 1 ? "contacto" : "contactos"}
            </h3>
            <p className="text-gray-500 mb-6">
              ¿Estás seguro de que quieres eliminar{" "}
              {selectedContacts.length === 1
                ? "este contacto"
                : `estos ${selectedContacts.length} contactos`}
              ? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteContacts}>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
      <AddContact
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateContact}
      />
    </div>
  );
}
