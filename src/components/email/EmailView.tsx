import {
  ArrowLeft,
  Star,
  Reply,
  Forward,
  MoreVertical,
  Download,
  Paperclip,
  File,
  Trash2,
  Archive,
  Flag,
  ReplyAll,
  Clock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Tag,
} from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect, useRef } from "react";
import { useEmail } from "../../contexts/EmailContext";
import { useToast } from "../ui/toast";
import { ConfirmModal } from "../ui/confirmModal";
import { ReplyEmail } from "./ReplyEmail";
import { ForwardEmail } from "./ForwardEmail";
import type { Email } from "../../types/email";

interface EmailViewProps {
  email: Email;
  onClose: () => void;
}

export function EmailView({ email, onClose }: EmailViewProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [showReplyAll, setShowReplyAll] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isRead, setIsRead] = useState(email.isRead);
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteEmail, moveToFolder, toggleStar, sendEmail, markAsRead } =
    useEmail();
  const toast = useToast();

  // Marcar como leído automáticamente
  useEffect(() => {
    if (!email.isRead) {
      markAsRead(email._id, true);
      setIsRead(true);
    }
  }, [email._id, email.isRead, markAsRead]);

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Función para obtener el nombre del remitente desde el email
  const getSenderName = (fromEmail: string) => {
    const match = fromEmail.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return match[1].trim();
    }
    return fromEmail.split("@")[0];
  };

  // Función para obtener solo el email del remitente
  const getSenderEmail = (fromEmail: string) => {
    const match = fromEmail.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return match[2].trim();
    }
    return fromEmail;
  };

  // Función para generar color del avatar basado en el nombre
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Función para formatear fecha de manera más amigable
  const formatEmailDate = (date: string | Date) => {
    const emailDate = new Date(date);
    const now = new Date();
    const diffInHours =
      (now.getTime() - emailDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Hace unos minutos";
    } else if (diffInHours < 24) {
      return format(emailDate, "HH:mm", { locale: es });
    } else if (diffInHours < 168) {
      return format(emailDate, "EEEE HH:mm", { locale: es });
    } else {
      return format(emailDate, "dd MMM yyyy, HH:mm", { locale: es });
    }
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      await deleteEmail(email._id);
      toast.show({
        title: "Correo eliminado",
        description: "El correo ha sido eliminado exitosamente",
        type: "success",
        duration: 3000,
      });
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error("Error al eliminar el email:", error);
      toast.show({
        title: "Error al eliminar",
        description:
          "No se pudo eliminar el correo. Por favor, inténtalo de nuevo.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async () => {
    try {
      await moveToFolder(email._id, "ARCHIVE");
      setShowMenu(false);
      toast.show({
        title: "Correo archivado",
        description: "El correo ha sido movido al archivo",
        type: "success",
        duration: 3000,
      });
      onClose();
    } catch (error) {
      console.error("Error al archivar el email:", error);
      toast.show({
        title: "Error al archivar",
        description:
          "No se pudo archivar el correo. Por favor, inténtalo de nuevo.",
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleToggleStar = async () => {
    try {
      await toggleStar(email._id);
      setShowMenu(false);
      toast.show({
        title: email.isStarred
          ? "Estrella removida"
          : "Correo marcado con estrella",
        description: email.isStarred
          ? "El correo ya no está marcado como favorito"
          : "El correo ha sido marcado como favorito",
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error al marcar/desmarcar estrella:", error);
      toast.show({
        title: "Error",
        description:
          "No se pudo actualizar la estrella. Por favor, inténtalo de nuevo.",
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleToggleRead = async () => {
    try {
      await markAsRead(email._id, !isRead);
      setIsRead(!isRead);
      toast.show({
        title: isRead ? "Marcado como no leído" : "Marcado como leído",
        type: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error al cambiar estado de lectura:", error);
    }
  };

  const handleReply = () => setShowReply(true);
  const handleReplyAll = () => setShowReplyAll(true);
  const handleForward = () => setShowForward(true);

  const handleCloseComposer = () => {
    setShowReply(false);
    setShowReplyAll(false);
    setShowForward(false);
  };

  const senderName = getSenderName(email.from);
  const senderEmail = getSenderEmail(email.from);
  const hasMultipleRecipients =
    email.to.length > 1 || (email.cc && email.cc.length > 0);
  const avatarColor = getAvatarColor(senderName);

  return (
    <>
      <div className="flex-1 bg-white flex flex-col h-full">
        {/* Header moderno con gradiente sutil */}
        <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            {/* Título y acciones principales */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Tooltip content="Volver">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="lg:hidden shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-semibold text-gray-900 truncate">
                    {email.subject || "(Sin asunto)"}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    {!isRead && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Nuevo
                      </span>
                    )}
                    {email.isImportant && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Importante
                      </span>
                    )}
                    {email.hasAttachments && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <Paperclip className="w-3 h-3" />
                        {email.attachments?.length || 0}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones principales */}
              <div className="flex items-center gap-1 shrink-0">
                <Tooltip
                  content={
                    isRead ? "Marcar como no leído" : "Marcar como leído"
                  }
                >
                  <Button variant="ghost" size="sm" onClick={handleToggleRead}>
                    {isRead ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </Tooltip>

                <Tooltip
                  content={
                    email.isStarred
                      ? "Quitar de favoritos"
                      : "Agregar a favoritos"
                  }
                >
                  <Button variant="ghost" size="sm" onClick={handleToggleStar}>
                    <Star
                      className={`w-4 h-4 ${
                        email.isStarred
                          ? "text-yellow-500 fill-current"
                          : "text-gray-400"
                      }`}
                    />
                  </Button>
                </Tooltip>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <Tooltip content="Responder">
                  <Button variant="ghost" size="sm" onClick={handleReply}>
                    <Reply className="w-4 h-4" />
                  </Button>
                </Tooltip>

                {hasMultipleRecipients && (
                  <Tooltip content="Responder a todos">
                    <Button variant="ghost" size="sm" onClick={handleReplyAll}>
                      <ReplyAll className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                )}

                <Tooltip content="Reenviar">
                  <Button variant="ghost" size="sm" onClick={handleForward}>
                    <Forward className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Menú dropdown mejorado */}
                <div className="relative" ref={menuRef}>
                  <Tooltip content="Más opciones">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </Tooltip>

                  {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                      <button
                        onClick={handleArchive}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <Archive className="w-4 h-4 text-gray-500" />
                        Archivar
                      </button>
                      <button
                        onClick={() => setShowMenu(false)}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <Flag className="w-4 h-4 text-gray-500" />
                        {email.isImportant
                          ? "Quitar importancia"
                          : "Marcar como importante"}
                      </button>
                      <div className="h-px bg-gray-200 my-2" />
                      <button
                        onClick={handleDeleteClick}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información del remitente mejorada */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-lg shadow-md`}
                >
                  {senderName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {senderName}
                    </h3>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{senderEmail}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatEmailDate(email.date)}
                    </div>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      <User className="w-3 h-3" />
                      Para: {email.to.length} destinatario
                      {email.to.length > 1 ? "s" : ""}
                      {showDetails ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles expandibles */}
            {showDetails && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Para:</span>
                    <span className="ml-2 text-gray-600">
                      {email.to.join(", ")}
                    </span>
                  </div>
                  {email.cc && email.cc.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">CC:</span>
                      <span className="ml-2 text-gray-600">
                        {email.cc.join(", ")}
                      </span>
                    </div>
                  )}
                  {email.bcc && email.bcc.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">BCC:</span>
                      <span className="ml-2 text-gray-600">
                        {email.bcc.join(", ")}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Fecha:</span>
                    <span className="ml-2 text-gray-600">
                      {format(
                        new Date(email.date),
                        "EEEE, dd 'de' MMMM 'de' yyyy 'a las' HH:mm",
                        { locale: es }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contenido del email mejorado */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Etiquetas */}
            {email.labels && email.labels.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {email.labels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    <Tag className="w-3 h-3" />
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Contenido principal */}
            <div className="prose prose-lg max-w-none">
              {email.html ? (
                <div
                  dangerouslySetInnerHTML={{ __html: email.html }}
                  className="email-content"
                />
              ) : email.text ? (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {email.text}
                </div>
              ) : email.snippet ? (
                <div className="text-gray-600 italic text-lg leading-relaxed">
                  {email.snippet}
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-12">
                  <File className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  Sin contenido disponible
                </div>
              )}
            </div>

            {/* Archivos adjuntos mejorados */}
            {email.hasAttachments &&
              email.attachments &&
              email.attachments.length > 0 && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                    Archivos adjuntos ({email.attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {email.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <File className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.filename}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {attachment.contentType}
                            {attachment.size &&
                              ` • ${Math.round(attachment.size / 1024)} KB`}
                          </p>
                        </div>
                        <Tooltip content="Descargar archivo">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar correo"
        message="¿Estás seguro de que quieres eliminar este correo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />

      {/* Componentes de Reply y Forward */}
      {showReply && (
        <ReplyEmail
          email={email}
          onClose={handleCloseComposer}
          handleSendEmail={sendEmail}
          replyAll={false}
        />
      )}

      {showReplyAll && (
        <ReplyEmail
          email={email}
          onClose={handleCloseComposer}
          handleSendEmail={sendEmail}
          replyAll={true}
        />
      )}

      {showForward && (
        <ForwardEmail
          email={email}
          onClose={handleCloseComposer}
          handleSendEmail={sendEmail}
        />
      )}
    </>
  );
}
