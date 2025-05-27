import React from "react";
import { User2 } from "lucide-react";
import { Link } from "react-router-dom";
import { CustomerAttribute, contactToAttributes } from "../../../lib";

interface ContactInfoProps {
  contact: any;
  conversationTitle?: string;
  contactLoading: boolean;
  contactError: boolean;
  hasContactId: boolean;
  onCreateContact: () => void;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({
  contact,
  conversationTitle,
  contactLoading,
  contactError,
  hasContactId,
  onCreateContact,
}) => {
  const attributes = contact
    ? contactToAttributes(contact, conversationTitle)
    : [];

  return (
    <div className="border-b border-gray-200 pb-4 px-4">
      <div className="flex items-center">
        <User2 className="w-4 h-4 text-gray-500 mr-2" />
        <div className="flex flex-col py-3">
          <h3 className="font-semibold text-gray-900">
            Información del Contacto
          </h3>
          {contact && (
            <Link to={`/contacts/${contact._id}`} target="_blank">
              <small className="text-gray-500 text-sm text-red-500 hover:text-red-600 hover:underline">
                Ver Contacto
              </small>
            </Link>
          )}
        </div>
      </div>

      {contactLoading ? (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      ) : contactError || !contact || !hasContactId ? (
        <div>
          <p className="text-sm text-gray-500 italic">
            No se encontró un contacto asociado a este chat.{" "}
            <span
              onClick={onCreateContact}
              className="text-blue-500 hover:text-blue-600 cursor-pointer hover:underline"
            >
              Crear Contacto
            </span>
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[200px] overflow-y-auto">
          {attributes.map((attr) => (
            <div
              key={attr.id}
              className="flex justify-between items-start group"
            >
              <div>
                <p className="text-sm text-gray-500">{attr.label}</p>
                <p className="text-gray-900">{attr.value || "-"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
