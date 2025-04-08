import { useState, useEffect } from "react";
import { Plus, X, Calendar, User, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { format } from "date-fns";
import { contactsService } from "../../services/contactsService";
import { dealsService } from "../../services/dealsService";
import { normalizeContact } from "../../lib/parseContacts";
import type { Contact } from "../../types/contact";

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deal: any) => void;
  initialStage?: string;
}

interface DealField {
  _id: string;
  type: string;
  name: string;
  key: string;
  required: boolean;
  options?: string[];
}

export function CreateDealModal({
  isOpen,
  onClose,
  onSubmit,
  initialStage = "",
}: CreateDealModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    stage: initialStage,
    expectedCloseDate: format(new Date(), "yyyy-MM-dd"),
    contact: {
      id: "",
      name: "",
      email: "",
      phone: "",
    },
    fields: {} as Record<string, string>,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showContactResults, setShowContactResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [stages, setStages] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<DealField[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stagesResponse, fieldsResponse] = await Promise.all([
          dealsService.getStatuses("66c6370ad573dacc51e620f0"),
          dealsService.getDealsFields("66c6370ad573dacc51e620f0"),
        ]);

        setStages(stagesResponse.data || []);
        setCustomFields(fieldsResponse.data || []);

        // Initialize fields in formData
        const initialFields = fieldsResponse.data.reduce(
          (acc: Record<string, string>, field: DealField) => {
            acc[field.key] = "";
            return acc;
          },
          {}
        );

        setFormData((prev) => ({
          ...prev,
          fields: initialFields,
        }));
      } catch (error) {
        console.error("Error loading form data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const searchContacts = async () => {
      if (!searchTerm) {
        setContacts([]);
        return;
      }

      try {
        setIsSearching(true);
        const response = await contactsService.searchContacts(searchTerm);
        setContacts(response.data.map(normalizeContact));
      } catch (error) {
        console.error("Error searching contacts:", error);
        setContacts([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchContacts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Transformar los fields de objeto a array con la estructura requerida
    const formattedFields = Object.entries(formData.fields)
      .map(([key, value]) => {
        const field = customFields.find((f) => f.key === key);
        return {
          field: field?._id, // usa el ObjectId real
          value: value,
        };
      })
      .filter((f) => f.field);

    // Crear una copia del formData con fields transformado
    const formDataToSubmit = {
      ...formData,
      fields: formattedFields,
    };

    onSubmit(formDataToSubmit);
    // onClose();
  };

  const handleSelectContact = (contact: Contact) => {
    setFormData({
      ...formData,
      contact: {
        id: contact.id,
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email || "",
        phone: contact.phone || "",
      },
    });
    setSearchTerm(`${contact.firstName} ${contact.lastName}`);
    setShowContactResults(false);
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: value,
      },
    }));
  };

  const renderCustomField = (field: DealField) => {
    const value = formData.fields[field.key] || "";

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
            placeholder={`Enter ${field.name.toLowerCase()}`}
            required={field.required}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
            placeholder={`Enter ${field.name.toLowerCase()}`}
            required={field.required}
          />
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
            required={field.required}
          >
            <option value="">Select {field.name.toLowerCase()}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo negocio">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Buscar contacto *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowContactResults(true);
              }}
              className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
              placeholder="Buscar por nombre o email..."
            />
            {showContactResults && (searchTerm || isSearching) && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border overflow-hidden">
                {isSearching ? (
                  <div className="p-3 text-center text-gray-500">
                    Buscando...
                  </div>
                ) : contacts.length > 0 ? (
                  <ul className="max-h-60 overflow-auto divide-y divide-gray-100">
                    {contacts.map((contact) => (
                      <li
                        key={contact.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleSelectContact(contact)}
                      >
                        <div className="font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </div>
                        {contact.email && (
                          <div className="text-sm text-gray-500">
                            {contact.email}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : searchTerm ? (
                  <div className="p-3 text-center text-gray-500">
                    No se encontraron contactos
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Deal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del negocio *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
              placeholder="Ej: Proyecto de consultoría"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Valor *
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                required
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                className="block w-full pl-7 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha estimada de cierre
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expectedCloseDate: e.target.value,
                  })
                }
                className="block w-full pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Etapa
            </label>
            <select
              value={formData.stage}
              onChange={(e) =>
                setFormData({ ...formData, stage: e.target.value })
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
            >
              {stages.map((stage) => (
                <option key={stage._id} value={stage._id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Información Adicional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customFields.map((field) => (
                <div key={field._id}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field.name}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {renderCustomField(field)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!formData.name || !formData.value || !formData.contact.id}
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear negocio
          </Button>
        </div>
      </form>
    </Modal>
  );
}
