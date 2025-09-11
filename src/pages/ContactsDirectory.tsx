import { useMemo, useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Trash2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  MessageCircle,
  Download,
  Upload,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { contactsService } from "../services/contactsService";
import { importService } from "../services/importService";
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
import ImportContactsModal from "../components/contacts/ImportContactsModal";

export function ContactsDirectory() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters] = useState<ContactFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10,
  });
  const [totalContacts, setTotalContacts] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterCondition[]>([]);
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const navigate = useNavigate();

  const toast = useToast();

  const debouncedSearch = useDebouncer(searchTerm, 500);

  const getInitials = (first?: string, last?: string) => {
    const a = (first || "").trim();
    const b = (last || "").trim();
    const firstChar = a ? a[0] : "";
    const lastChar = b ? b[0] : "";
    return (firstChar + lastChar || (a || "? ").slice(0, 2)).toUpperCase();
  };

  const avatarBg = (key: string) => {
    const colors = [
      "bg-gradient-to-br from-violet-500 to-blue-500",
      "bg-gradient-to-br from-emerald-500 to-teal-500",
      "bg-gradient-to-br from-fuchsia-500 to-rose-500",
      "bg-gradient-to-br from-orange-500 to-amber-500",
      "bg-gradient-to-br from-sky-500 to-cyan-500",
      "bg-gradient-to-br from-indigo-500 to-purple-500",
      "bg-gradient-to-br from-lime-500 to-green-500",
      "bg-gradient-to-br from-pink-500 to-rose-500",
    ];
    let hash = 0;
    for (let i = 0; i < key.length; i++)
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return colors[hash % colors.length];
  };

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

  // Opciones dinámicas para filtros rápidos
  const uniqueCompanies = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => c.companyName && set.add(c.companyName));
    return Array.from(set).sort();
  }, [contacts]);

  const uniqueTags = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => c.tags?.forEach((t) => set.add(t)));
    if (contacts.some((c) => c.companyType)) set.add("companyType");
    return Array.from(set).filter(Boolean).sort();
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const byCompany =
        companyFilter === "all" ||
        (c.companyName || "").toLowerCase() === companyFilter.toLowerCase();
      const byTag =
        tagFilter === "all" ||
        (tagFilter === "companyType"
          ? Boolean(c.companyType)
          : (c.tags || [])
              .map((t) => t.toLowerCase())
              .includes(tagFilter.toLowerCase()));
      return byCompany && byTag;
    });
  }, [contacts, companyFilter, tagFilter]);

  // Eliminada selección masiva por UI de tarjetas

  // Eliminada selección individual por UI de tarjetas

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

  const handleImportContacts = async (
    file: File,
    mapping: Record<string, string>
  ) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("mapping", JSON.stringify(mapping));

      await importService.importContacts(formData);

      toast.show({
        title: "Éxito",
        description: "Contactos importados correctamente",
        type: "success",
      });

      setShowImportModal(false);
      loadContacts();
    } catch (err) {
      toast.show({
        title: "Error",
        description: "No se pudieron importar los contactos",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportContacts = async () => {
    try {
      setIsLoading(true);

      const blob = await contactsService.exportContacts();

      // Crear URL para descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contactos_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();

      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.show({
        title: "Éxito",
        description: "Contactos exportados correctamente",
        type: "success",
      });
    } catch (err) {
      toast.show({
        title: "Error",
        description: "No se pudieron exportar los contactos",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await contactsService.deleteContact(contactId);
      toast.show({
        title: "Éxito",
        description: "Contacto eliminado correctamente",
        type: "success",
      });
      loadContacts();
    } catch (err) {
      toast.show({
        title: "Error",
        description: "No se pudo eliminar el contacto",
        type: "error",
      });
    }
    setContactToDelete(null);
  };

  const handleMenuToggle = (contactId: string) => {
    setOpenMenuId(openMenuId === contactId ? null : contactId);
  };

  const handleDeleteClick = (contactId: string) => {
    setContactToDelete(contactId);
    setOpenMenuId(null);
  };

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && menuRefs.current[openMenuId]) {
        const menuElement = menuRefs.current[openMenuId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

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
                Contactos
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {totalContacts} contactos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportContacts}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImportModal(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Añadir contacto
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar contactos por nombre, email, empresa..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sm:col-span-1">
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action"
              >
                <option value="all">Todas las empresas</option>
                {uniqueCompanies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-1">
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action"
              >
                <option value="all">Todas las etiquetas</option>
                {uniqueTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
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
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
            No se encontraron contactos
          </div>
        ) : (
          <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredContacts.map((contact) => (
              <div
                key={contact._id}
                className="bg-white rounded-2xl shadow-sm border p-6 relative"
              >
                {/* Menú desplegable */}
                <div
                  className="absolute top-3 right-3 z-10"
                  ref={(el) => {
                    menuRefs.current[contact._id] = el;
                  }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuToggle(contact._id);
                    }}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>

                  {openMenuId === contact._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(contact._id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center mb-4">
                  <div
                    className={`w-16 h-16 rounded-full text-white flex items-center justify-center text-lg font-semibold shadow-sm ${avatarBg(
                      (contact.firstName || "") + (contact.lastName || "")
                    )}`}
                  >
                    {getInitials(contact.firstName, contact.lastName)}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    className="block w-full text-center text-base font-semibold text-gray-900 hover:underline leading-6 min-h-[48px] max-h-[48px] overflow-hidden line-clamp-2"
                    onClick={() => handleViewContact(contact._id)}
                  >
                    {contact.firstName} {contact.lastName}
                  </button>
                  <div className="min-h-[40px]">
                    {contact.position && (
                      <div className="mt-1 text-sm text-gray-600 line-clamp-1">
                        {contact.position}
                      </div>
                    )}
                    {contact.companyName && (
                      <div className="text-sm text-gray-400 -mt-0.5 line-clamp-1">
                        {contact.companyName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  {contact.email && (
                    <div className="flex items-center text-gray-700">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.mobile && (
                    <div className="flex items-center text-gray-700">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{contact.mobile}</span>
                    </div>
                  )}
                  {contact.city && (
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{contact.city}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-700">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-emerald-600 font-medium">
                      ${Number(contact.totalRevenue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {contact.companyType && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {contact.companyType}
                    </span>
                  )}
                  {(contact.tags || []).slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                    size="sm"
                    onClick={() =>
                      navigate(
                        `/conversations?openPhone=${encodeURIComponent(
                          contact.mobile || ""
                        )}`
                      )
                    }
                  >
                    <MessageCircle className="w-4 h-4 mr-2 text-white" />
                    WhatsApp
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                    size="sm"
                    onClick={() => navigate(`/email`)}
                  >
                    <Mail className="w-4 h-4 mr-2 text-white" />
                    Email
                  </Button>
                </div>

                {/* Footer de acciones eliminado (eliminar y ver). El título ya lleva al detalle. */}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalContacts > 0 && (
          <div className="mt-6 flex items-center justify-between">
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
      {/* Individual Contact Delete Confirmation Dialog */}
      {contactToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Eliminar contacto
            </h3>
            <p className="text-gray-500 mb-6">
              ¿Estás seguro de que quieres eliminar este contacto? Esta acción
              no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setContactToDelete(null)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteContact(contactToDelete)}
              >
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
      <ImportContactsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportContacts}
      />
    </div>
  );
}
