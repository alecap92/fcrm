import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Search, User } from "lucide-react";
import { contactsService } from "../../../services/contactsService";
import { normalizeContact } from "../../../lib/parseContacts";
import type { Contact } from "../../../types/contact";
import templatesService from "../../../services/templatesService";
import { ITemplate } from "../../../types/templates";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (chatData: { template: ITemplate; phoneNumber: string }) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [newChatName, setNewChatName] = useState("");
  const [newChatPlatform, setNewChatPlatform] = useState("whatsapp");
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showContactResults, setShowContactResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templates, setTemplates] = useState<ITemplate[]>([]);

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
        console.error("Error buscando contactos:", error);
        setSearchTerm("");
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchContacts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setNewChatName(`${contact.firstName} ${contact.lastName}`);
    setSearchTerm(`${contact.firstName} ${contact.lastName}`);
    setShowContactResults(false);
  };

  const handleNewChat = () => {
    if (!selectedContact || !selectedTemplate || !selectedContact.mobile)
      return;

    const selectedTemplateData = templates.find(
      (t) => t.name === selectedTemplate
    );

    if (!selectedTemplateData) return;

    const chatData = {
      phoneNumber: selectedContact.mobile,
      template: selectedTemplateData,
    };

    onSubmit(chatData);
    onClose();
  };

  const fetchTemplates = async () => {
    const response: any = await templatesService.getTemplates(0, 100);

    setTemplates(response.data.data);
  };

  useEffect(() => {
    fetchTemplates();
  }, [selectedContact]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Nueva Conversación
        </h3>
        <div className="space-y-4">
          {/* Búsqueda de Contactos */}
          <div>
            <div className="flex items-center gap-2">
              <Search size={16} className="text-gray-400" />
              <label className="block text-sm font-medium text-gray-700">
                Buscar contacto *
              </label>
            </div>
            <div className="relative mt-1">
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
                className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          key={contact._id}
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

          {/* Plantillas de WhatsApp */}
          {newChatPlatform === "whatsapp" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plantilla de Mensaje
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar plantilla</option>
                {templates.map((template) => (
                  <option key={template.name} value={template.name}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button onClick={onClose} variant="outline">
              Cancelar
            </Button>
            <Button
              onClick={handleNewChat}
              disabled={!selectedContact || !selectedTemplate}
            >
              Crear Conversación
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
