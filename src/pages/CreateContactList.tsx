import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Filter,
  Tags,
  Mail,
  Phone,
  Building2,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";

import { ActiveFilters } from "../components/contacts/ActiveFilters";
import type { Contact, FilterCondition } from "../types/contact";
import FiltersModal from "../components/contacts/FiltersModal";
import { contactsService } from "../services/contactsService";
import { normalizeContact } from "../lib/parseContacts";
import contactListService from "../services/contactListService";

export function CreateContactList() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterCondition[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApplyFilters = async (filters: FilterCondition[]) => {
    setActiveFilters(filters);

    const response = await contactsService.filterContacts(filters);
    setContacts(response.data.map(normalizeContact));
    console.log(response.data);
  };

  const handleRemoveFilter = (id: string) => {
    setActiveFilters((current) => current.filter((filter) => filter.id !== id));
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
    setContacts([]);
  };

  const handleSave = async () => {
    try {
      const newErrors: Record<string, string> = {};

      if (!name.trim()) {
        newErrors.name = "List name is required";
      }

      // Separar filtros normales de los filtros hasDeals
      const hasDealsFilter = activeFilters.find(
        (filter) => filter.key === "hasDeals"
      );
      const normalFilters = activeFilters.filter(
        (filter) => filter.key !== "hasDeals"
      );

      // Construir la estructura correcta para el objeto form
      const form: any = {
        name,
        description,
        contactIds: selectedContacts,
        filters: normalFilters,
        isDynamic: false,
      };

      // Si existe un filtro hasDeals, agregarlo en el formato correcto
      if (hasDealsFilter) {
        form.Deals = [
          {
            field: "hasDeals",
            value: hasDealsFilter.operator === "true",
          },
        ];
      }

      console.log(form);

      await contactListService.createContactList(form);

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Reset form
      setName("");
      setDescription("");
      setSelectedContacts([]);
      setActiveFilters([]);
      setContacts([]);
      setErrors({});
      setShowFilters(false);
      navigate("/contacts/lists");
    } catch (error) {
      console.error("Error creating contact list:", error);
      setErrors({
        name: "An error occurred while creating the list",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/contacts/lists")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                New Contact List
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Create a new list based on filters
              </p>
            </div>
          </div>

          <div className="max-w-3xl space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                List Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-action focus:ring-action"
                } focus:ring focus:ring-opacity-50`}
                placeholder="E.g., VIP Clients"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                placeholder="Describe the purpose of this list..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Select Contacts
                </h2>
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(true)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {activeFilters.length > 0 && (
                <div className="mb-4">
                  <ActiveFilters
                    filters={activeFilters}
                    onRemove={handleRemoveFilter}
                    onClearAll={handleClearFilters}
                  />
                </div>
              )}

              {errors.contacts && (
                <div className="mb-4">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.contacts}
                  </p>
                </div>
              )}

              <div className="bg-white rounded-lg shadow overflow-hidden">
                {contacts.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-action focus:ring-action"
                            checked={
                              selectedContacts.length === contacts.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedContacts(contacts.map((c) => c._id));
                              } else {
                                setSelectedContacts([]);
                              }
                            }}
                          />
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tags
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contacts.map((contact) => (
                        <tr key={contact._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-action focus:ring-action"
                              checked={selectedContacts.includes(contact._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedContacts([
                                    ...selectedContacts,
                                    contact._id,
                                  ]);
                                } else {
                                  setSelectedContacts(
                                    selectedContacts.filter(
                                      (id) => id !== contact._id
                                    )
                                  );
                                }
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail className="w-4 h-4 mr-1" />
                                {contact.email}
                              </div>
                              {contact.phone && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {contact.phone}
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
                              {contact?.tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-action/10 text-action"
                                >
                                  <Tags className="w-3 h-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <Filter className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Agrega filtros para comenzar
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      Utiliza el botón de filtros en la parte superior para
                      encontrar contactos y agregarlos a tu lista.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(true)}
                      className="mt-4"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Agregar filtros
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/contacts/lists")}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save List
              </Button>
            </div>
          </div>
        </div>
      </div>

      <FiltersModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        activeFilters={activeFilters}
      />
    </div>
  );
}
