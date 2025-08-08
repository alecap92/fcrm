import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import ChatSidebar from "../ChatSidebar";
import { MessageInput } from "../input/MessageInput";
import { LibraryUpload } from "./LibraryUpload";
import { useChatContext } from "../../../contexts/ChatContext";
import { MessageList } from "../messages";
import { MessageTemplates, QuickResponses } from "../templates";
import templatesService from "../../../services/templatesService";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: {
    id: string;
    title: string;
  };
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, chat }) => {
  // Usar el contexto del chat
  const {
    message,
    setMessage,
    conversationDetail,
    messages,
    hasMore,
    isLoading,
    isInitialLoad,
    error,
    isSubmitting,
    isUploadingFile,
    uploadError,
    clearUploadError,
    textareaRef,
    handleLoadMore,
    handleSendMessage,
    handlePriorityChange,
    handleAttachmentClick,
    handleLibraryUpload,
    isConversationExpired,
    groupedMessages,
    initializeChat,
    cleanupChat,
  } = useChatContext();

  // Estado local solo para modales
  const [showQuickResponsesModal, setShowQuickResponsesModal] = useState(false);
  const [showMessageTemplates, setShowMessageTemplates] = useState(false);
  const [showLibraryUpload, setShowLibraryUpload] = useState(false);

  // Inicializar el chat cuando se abre el modal
  useEffect(() => {
    if (isOpen && chat.id) {
      initializeChat(chat.id, isOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, chat.id]);

  // Cerrar con tecla ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Limpiar el chat cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      cleanupChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuickResponseSelect = (content: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = message;

      // Crear nuevo texto combinando el contenido actual y la respuesta rápida
      const newText =
        currentValue.substring(0, start) +
        content +
        currentValue.substring(end);

      // Actualizar el estado del mensaje
      setMessage(newText);

      // Cerrar el modal
      setShowQuickResponsesModal(false);

      // Después de que el estado se actualice y el componente se re-renderice, reposicionar el cursor
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            start + content.length,
            start + content.length
          );
        }
      }, 0);
    } else {
      // Si no hay referencia al textarea, simplemente establecer el mensaje completo
      setMessage(content);
      setShowQuickResponsesModal(false);
    }
  };

  const handleMessageTemplateSelect = (templateText: string) => {
    // Insertar el texto de la plantilla en el textarea (similar a handleQuickResponseSelect)
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = message;

      // Crear nuevo texto combinando el contenido actual y la plantilla
      const newText =
        currentValue.substring(0, start) +
        templateText +
        currentValue.substring(end);

      // Actualizar el estado del mensaje
      setMessage(newText);

      // Cerrar el modal
      setShowMessageTemplates(false);

      // Después de que el estado se actualice y el componente se re-renderice, reposicionar el cursor
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            start + templateText.length,
            start + templateText.length
          );
        }
      }, 0);
    } else {
      // Si no hay referencia al textarea, simplemente establecer el mensaje completo
      setMessage(templateText);
      setShowMessageTemplates(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-[90vw] h-[90vh] rounded-lg flex overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900">
                {conversationDetail?.conversation?.title || chat.title}
                <span className="text-sm text-gray-500">
                  {" - "}
                  {
                    conversationDetail?.conversation?.participants?.contact
                      ?.reference
                  }
                </span>
              </h3>
              {conversationDetail?.conversation && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">Prioridad:</span>

                  <select
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      conversationDetail.conversation.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : conversationDetail.conversation.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                    onChange={handlePriorityChange}
                    value={conversationDetail.conversation.priority}
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {error ? (
            <div className="flex-1 flex items-center justify-center text-red-500">
              {error}
            </div>
          ) : isLoading && isInitialLoad ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">
                Cargando conversación...
              </span>
            </div>
          ) : (
            <MessageList
              messages={messages}
              onLoadMore={handleLoadMore}
              isLoading={isLoading}
              hasMore={hasMore}
              isInitialLoad={isInitialLoad}
            />
          )}

          <MessageInput
            message={message}
            onMessageChange={setMessage}
            onSend={handleSendMessage}
            onAttachment={handleAttachmentClick}
            onQuickResponse={() => setShowQuickResponsesModal(true)}
            textareaRef={textareaRef}
            onMessageTemplates={() => setShowMessageTemplates(true)}
            isSubmitting={isSubmitting}
            isDisabled={isConversationExpired()}
            disabledMessage={
              isConversationExpired()
                ? "Debes iniciar una nueva conversación"
                : undefined
            }
            onLibraryUpload={handleLibraryUpload}
            isUploadingFile={isUploadingFile}
            uploadError={uploadError}
            onClearUploadError={clearUploadError}
          />
        </div>

        <QuickResponses
          isOpen={showQuickResponsesModal}
          onClose={() => setShowQuickResponsesModal(false)}
          onSelect={handleQuickResponseSelect}
        />

        <LibraryUpload
          isOpen={showLibraryUpload}
          onClose={() => setShowLibraryUpload(false)}
          onSelect={() => {}}
        />

        {/* Sidebar */}
        {conversationDetail?.conversation && (
          <ChatSidebar
            chatId={chat.id}
            conversation={conversationDetail.conversation}
          />
        )}
        <MessageTemplates
          isOpen={showMessageTemplates}
          onClose={() => setShowMessageTemplates(false)}
          onSelect={(templateText) => handleMessageTemplateSelect(templateText)}
          phoneNumber={
            conversationDetail?.conversation?.participants?.contact?.reference
          }
        />
      </div>
    </div>
  );
};

export default ChatModal;
