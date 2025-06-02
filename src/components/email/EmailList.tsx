import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Star,
  Paperclip,
  MoreVertical,
  Archive,
  Trash2,
  Loader2,
} from "lucide-react";
import type { Email } from "../../types/email";
import { useEmail } from "../../contexts/EmailContext";
import { Tooltip } from "../ui/tooltip";
import { useState } from "react";

interface EmailListProps {
  emails: Email[];
  selectedEmail: Email | null;
  onSelectEmail: (email: Email) => void;
  selectedEmails: string[];
  onSelectEmailCheckbox: (emailId: string) => void;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EmailList({
  emails,
  selectedEmail,
  onSelectEmail,
  selectedEmails,
  onSelectEmailCheckbox,
  onSelectAll,
}: EmailListProps) {
  const { toggleStar, moveToFolder, deleteEmail, state } = useEmail();
  const [hoveredEmail, setHoveredEmail] = useState<string | null>(null);
  const [deletingEmails, setDeletingEmails] = useState<Set<string>>(new Set());

  const formatEmailDate = (date: string | Date) => {
    const emailDate = new Date(date);
    const now = new Date();
    const diffInHours =
      (now.getTime() - emailDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(emailDate, "HH:mm", { locale: es });
    } else if (diffInHours < 168) {
      // 7 días
      return format(emailDate, "EEE", { locale: es });
    } else {
      return format(emailDate, "dd MMM", { locale: es });
    }
  };

  const extractSenderName = (from: string) => {
    // Extraer nombre del formato "Nombre <email@domain.com>" o solo email
    const match =
      from.match(/^"?([^"<]+)"?\s*<.*>$/) || from.match(/^([^<]+)<.*>$/);
    if (match) {
      return match[1].trim();
    }
    // Si es solo un email, extraer la parte antes del @
    const emailMatch = from.match(/^([^@]+)@/);
    return emailMatch ? emailMatch[1] : from;
  };

  const getInitials = (name: string) => {
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleStarClick = async (e: React.MouseEvent, emailId: string) => {
    e.stopPropagation();
    await toggleStar(emailId);
  };

  const handleArchive = async (e: React.MouseEvent, emailId: string) => {
    e.stopPropagation();
    await moveToFolder(emailId, "ARCHIVE");
  };

  const handleDelete = async (e: React.MouseEvent, emailId: string) => {
    e.stopPropagation();

    // Agregar el email al set de emails que se están eliminando
    setDeletingEmails((prev) => new Set(prev).add(emailId));

    try {
      await deleteEmail(emailId);
    } catch (error) {
      console.error("Error al eliminar email:", error);
    } finally {
      // Remover el email del set de emails que se están eliminando
      setDeletingEmails((prev) => {
        const newSet = new Set(prev);
        newSet.delete(emailId);
        return newSet;
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header simplificado para selección múltiple */}
      {selectedEmails.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                checked={
                  selectedEmails.length === emails.length && emails.length > 0
                }
                onChange={onSelectAll}
                disabled={state.isLoading}
              />
              <span className="text-sm font-medium text-blue-700">
                {selectedEmails.length} seleccionados
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                onClick={() => {
                  selectedEmails.forEach((emailId) =>
                    moveToFolder(emailId, "ARCHIVE")
                  );
                }}
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-blue-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                onClick={() => {
                  selectedEmails.forEach((emailId) => deleteEmail(emailId));
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de emails */}
      <div className="flex-1 overflow-y-auto">
        {state.isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-lg font-medium">Cargando correos...</p>
            <p className="text-sm">Por favor espera un momento</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Archive className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium">No hay correos</p>
            <p className="text-sm">Esta carpeta está vacía</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {emails.map((email) => {
              const senderName = extractSenderName(email.from);
              const initials = getInitials(senderName);
              const isSelected = selectedEmails.includes(email._id);
              const isCurrentEmail = selectedEmail?._id === email._id;
              const isHovered = hoveredEmail === email._id;
              const isDeleting = deletingEmails.has(email._id);

              return (
                <div
                  key={email._id}
                  className={`
                    relative group transition-all duration-200 cursor-pointer
                    ${
                      isCurrentEmail
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-25"
                    }
                    ${!email.isRead ? "bg-blue-25" : ""}
                    ${isSelected ? "bg-blue-50" : ""}
                    ${isDeleting ? "opacity-50 pointer-events-none" : ""}
                  `}
                  onClick={() => !isDeleting && onSelectEmail(email)}
                  onMouseEnter={() => setHoveredEmail(email._id)}
                  onMouseLeave={() => setHoveredEmail(null)}
                >
                  <div className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                          checked={isSelected}
                          disabled={isDeleting}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (!isDeleting) {
                              onSelectEmailCheckbox(email._id);
                            }
                          }}
                        />
                      </div>

                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div
                          className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                          ${
                            !email.isRead
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        `}
                        >
                          {initials}
                        </div>
                      </div>

                      {/* Contenido principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span
                              className={`
                              text-sm font-medium truncate
                              ${
                                !email.isRead
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }
                            `}
                            >
                              {senderName}
                            </span>
                            {email.hasAttachments && (
                              <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-500">
                              {formatEmailDate(email.date)}
                            </span>

                            {/* Acciones rápidas */}
                            <div
                              className={`
                              flex items-center gap-1 transition-opacity duration-200
                              ${
                                (isHovered || isCurrentEmail) && !isDeleting
                                  ? "opacity-100"
                                  : "opacity-0"
                              }
                            `}
                            >
                              <Tooltip
                                content={
                                  email.isStarred
                                    ? "Quitar de favoritos"
                                    : "Marcar como favorito"
                                }
                              >
                                <button
                                  className={`
                                    p-1.5 rounded-md transition-colors
                                    ${
                                      email.isStarred
                                        ? "text-yellow-500 hover:text-yellow-600"
                                        : "text-gray-400 hover:text-yellow-500"
                                    }
                                    hover:bg-white
                                  `}
                                  onClick={(e) => handleStarClick(e, email._id)}
                                  disabled={isDeleting}
                                >
                                  <Star
                                    className={`w-4 h-4 ${
                                      email.isStarred ? "fill-current" : ""
                                    }`}
                                  />
                                </button>
                              </Tooltip>

                              <Tooltip content="Archivar">
                                <button
                                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
                                  onClick={(e) => handleArchive(e, email._id)}
                                  disabled={isDeleting}
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                              </Tooltip>

                              <Tooltip content="Eliminar">
                                <button
                                  className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-white transition-colors"
                                  onClick={(e) => handleDelete(e, email._id)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </Tooltip>
                            </div>
                          </div>
                        </div>

                        {/* Asunto */}
                        <h3
                          className={`
                          text-sm mb-1 line-clamp-1
                          ${
                            !email.isRead
                              ? "font-semibold text-gray-900"
                              : "font-medium text-gray-700"
                          }
                        `}
                        >
                          {email.subject || "(Sin asunto)"}
                        </h3>

                        {/* Snippet */}
                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                          {email.snippet ||
                            email.text?.substring(0, 150) ||
                            "Sin contenido disponible"}
                        </p>

                        {/* Etiquetas */}
                        {email.labels && email.labels.length > 0 && (
                          <div className="mt-2 flex items-center gap-1 flex-wrap">
                            {email.labels.slice(0, 3).map((labelId) => (
                              <span
                                key={labelId}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                              >
                                {labelId}
                              </span>
                            ))}
                            {email.labels.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{email.labels.length - 3} más
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Indicador de no leído */}
                  {!email.isRead && (
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
