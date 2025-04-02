import { useState, useEffect } from "react";
import { Search, Building2, Mail, Phone, X, UserPlus } from "lucide-react";
import { Button } from "../ui/button";
import type { Contact } from "../../types/contact";
import { contactsService } from "../../services/contactsService";
import { useDebouncer } from "../../hooks/useDebbouncer";
import { normalizeContact } from "../../lib/parseContacts";

interface ContactSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (contact: Contact) => void;
  onCreateNew?: () => void; // opción futura para botón "Nuevo Contacto"
}

export function ContactSelectionModal({
  isOpen,
  onClose,
  onSelect,
  onCreateNew,
}: ContactSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebouncer(searchTerm, 500);

  useEffect(() => {
    const searchContacts = async () => {
      try {
        setIsLoading(true);
        const response = debouncedSearch
          ? await contactsService.searchContacts(debouncedSearch)
          : await contactsService.getContacts();

        const result = Array.isArray(response.data.data)
          ? response.data.data
          : response.data || [];

        setContacts(result.map(normalizeContact));
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    searchContacts();
  }, [debouncedSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Seleccionar Cliente
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contactos..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-action"></div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron contactos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    onSelect(contact);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {contact.firstName ?? ""} {contact.lastName ?? ""}
                      </h3>
                      <div className="mt-1 text-sm text-gray-500 space-y-1">
                        {contact.companyName && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {contact.companyName}
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <Button className="w-full" onClick={onCreateNew}>
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Contacto
          </Button>
        </div>
      </div>
    </div>
  );
}
