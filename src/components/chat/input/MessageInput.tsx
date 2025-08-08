import {
  Paperclip,
  Workflow,
  ScrollText,
  Lightbulb,
  Brain,
  LucideIcon,
  Plane,
  BookUser,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "../../../lib/utils";
import { LibraryUpload } from "../modal/LibraryUpload";
import type { FileDocument } from "../../../services/filesService";

interface MessageInputProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  onAttachment: (file: File) => void;
  onQuickResponse: () => void;
  onMessageTemplates: () => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  disabledMessage?: string;
  onLibraryUpload: (file: FileDocument) => void;
  isUploadingFile?: boolean;
  uploadError?: string | null;
  onClearUploadError?: () => void;
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

interface ActionButtonProps {
  icon: LucideIcon;
  title: string;
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  title,
  onClick,
}) => {
  const isUploading = title.includes("Subiendo");
  const isDisabled = !onClick || isUploading;

  return (
    <Tooltip content={title}>
      <button
        className={`p-2 rounded-md focus:outline-none transition-colors ${
          isDisabled
            ? "bg-gray-100 cursor-not-allowed opacity-50"
            : "hover:bg-gray-100"
        }`}
        onClick={onClick}
        type="button"
        disabled={isDisabled}
      >
        {isUploading ? (
          <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        ) : (
          <Icon
            className={`w-5 h-5 ${
              isDisabled ? "text-gray-400" : "text-gray-500"
            }`}
          />
        )}
      </button>
    </Tooltip>
  );
};

export function MessageInput({
  message,
  onMessageChange,
  onSend,
  onAttachment,
  onQuickResponse,
  textareaRef,
  onMessageTemplates,
  isDisabled,
  disabledMessage,
  onLibraryUpload,
  isUploadingFile,
  uploadError,
  onClearUploadError,
}: MessageInputProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const actionButtons: ActionButtonProps[] = [
    {
      icon: BookUser,
      title: "Biblioteca",
      onClick: () => setIsLibraryOpen(true),
    },
    {
      icon: Paperclip,
      title: isUploadingFile ? "Subiendo archivo..." : "Adjuntos",
      onClick: () => !isUploadingFile && fileInputRef.current?.click(),
    },
    {
      icon: Lightbulb,
      title: "Respuestas predefinidas",
      onClick: onQuickResponse,
    },
    { icon: ScrollText, title: "Plantillas", onClick: onMessageTemplates },
    // { icon: Workflow, title: "Secuencias", onClick: onQuickResponse },
    // { icon: Brain, title: "ChatGPT", onClick: onQuickResponse },
  ];

  const handleSend = async () => {
    if (isDisabled || isUploadingFile) return;
    await onSend();
    // Mantener foco en el textarea para escribir el siguiente mensaje
    setTimeout(() => textareaRef?.current?.focus(), 0);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAttachment(file);
    }
    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLibrarySelect = (document: FileDocument) => {
    onLibraryUpload(document);
    setIsLibraryOpen(false);
  };

  return (
    <div className="bg-white border-t p-4">
      {uploadError && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span className="text-red-700 text-sm">{uploadError}</span>
          </div>
          {onClearUploadError && (
            <button
              onClick={onClearUploadError}
              className="text-red-500 hover:text-red-700 ml-2"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2">
          {actionButtons.map((button, index) => (
            <ActionButton
              key={index}
              icon={button.icon}
              title={button.title}
              onClick={isUploadingFile ? undefined : button.onClick}
            />
          ))}
        </div>
        <div className="relative">
          <textarea
            ref={textareaRef}
            placeholder={
              isUploadingFile ? "Subiendo archivo..." : "Escribe un mensaje"
            }
            className={cn(
              "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent resize-none",
              (isDisabled || isUploadingFile) && "opacity-50 cursor-not-allowed"
            )}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isDisabled || isUploadingFile}
            rows={3}
            style={{ minHeight: "60px", maxHeight: "120px" }}
          />
          {isDisabled && disabledMessage && !isUploadingFile && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 px-4 py-2 rounded-lg text-red-500 text-sm">
              {disabledMessage}
            </div>
          )}
          {isUploadingFile && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 px-4 py-2 rounded-lg text-blue-500 text-sm flex items-center">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mr-2" />
              Subiendo archivo...
            </div>
          )}
        </div>
        <div className="px-2 text-xs text-gray-500">
          {isUploadingFile
            ? "Esperando a que termine la subida del archivo..."
            : "Presiona Enter para enviar, Shift + Enter para nueva línea"}
        </div>
      </div>

      <LibraryUpload
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={handleLibrarySelect}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
        disabled={isUploadingFile}
      />
    </div>
  );
}
