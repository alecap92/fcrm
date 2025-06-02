import { useState, KeyboardEvent, useRef, useEffect } from "react";
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Paperclip,
  Send,
  File,
  MessageSquare,
  Eye,
  Code,
} from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";
import { QuickResponses } from "../chat/templates/QuickResponses";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface BaseEmailComposerProps {
  title: string;
  onClose: () => void;
  handleSendEmail: any;
  initialRecipients?: string[];
  initialSubject?: string;
  initialContent?: string;
  selectedInvoice?: any;
  showToField?: boolean;
  showCcField?: boolean;
  showBccField?: boolean;
}

export function BaseEmailComposer({
  title,
  onClose,
  handleSendEmail,
  initialRecipients = [],
  initialSubject = "",
  initialContent = "",
  selectedInvoice,
  showToField = true,
  showCcField = false,
  showBccField = false,
}: BaseEmailComposerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [recipients, setRecipients] = useState<string[]>(initialRecipients);
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [bccRecipients, setBccRecipients] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentCcInput, setCurrentCcInput] = useState("");
  const [currentBccInput, setCurrentBccInput] = useState("");
  const [subject, setSubject] = useState(initialSubject);
  const [content, setContent] = useState(initialContent);
  const [showHtmlView, setShowHtmlView] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showCc, setShowCc] = useState(showCcField);
  const [showBcc, setShowBcc] = useState(showBccField);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<any>(null);
  const toast = useToast();

  const handleSend = async () => {
    if (isSending) return;

    setIsSending(true);

    try {
      const emailData = {
        to: recipients,
        cc: ccRecipients.length > 0 ? ccRecipients : undefined,
        bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
        subject,
        content,
        attachments,
      };

      if (selectedInvoice) {
        await handleSendEmail(selectedInvoice, emailData);
      } else {
        await handleSendEmail(emailData);
      }

      toast.show({
        title: "Correo enviado exitosamente",
        description: `El correo fue enviado a ${recipients.join(", ")}`,
        type: "success",
        duration: 4000,
      });

      onClose();
    } catch (error) {
      console.error("Error al enviar el correo:", error);

      toast.show({
        title: "Error al enviar el correo",
        description:
          "Hubo un problema al enviar el correo. Por favor, inténtalo de nuevo.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    type: "to" | "cc" | "bcc"
  ) => {
    const currentValue =
      type === "to"
        ? currentInput
        : type === "cc"
        ? currentCcInput
        : currentBccInput;

    if ((e.key === "Tab" || e.key === ",") && currentValue.trim()) {
      e.preventDefault();
      addRecipient(type);
    } else if (e.key === "Enter" && currentValue.trim()) {
      e.preventDefault();
      addRecipient(type);
    } else if (e.key === "Backspace" && !currentValue) {
      const recipientList =
        type === "to"
          ? recipients
          : type === "cc"
          ? ccRecipients
          : bccRecipients;
      if (recipientList.length > 0) {
        removeRecipient(recipientList.length - 1, type);
      }
    }
  };

  const addRecipient = (type: "to" | "cc" | "bcc") => {
    const currentValue =
      type === "to"
        ? currentInput
        : type === "cc"
        ? currentCcInput
        : currentBccInput;
    const email = currentValue.trim().replace(",", "");

    if (email) {
      if (type === "to" && !recipients.includes(email)) {
        setRecipients([...recipients, email]);
        setCurrentInput("");
      } else if (type === "cc" && !ccRecipients.includes(email)) {
        setCcRecipients([...ccRecipients, email]);
        setCurrentCcInput("");
      } else if (type === "bcc" && !bccRecipients.includes(email)) {
        setBccRecipients([...bccRecipients, email]);
        setCurrentBccInput("");
      }
    }
  };

  const removeRecipient = (index: number, type: "to" | "cc" | "bcc") => {
    if (type === "to") {
      setRecipients(recipients.filter((_, i) => i !== index));
    } else if (type === "cc") {
      setCcRecipients(ccRecipients.filter((_, i) => i !== index));
    } else if (type === "bcc") {
      setBccRecipients(bccRecipients.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleQuickResponseSelect = (text: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      quill.insertText(range ? range.index : 0, text);
    }
    setShowQuickResponses(false);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
  ];

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.root.innerHTML = initialContent;
    }
  }, [initialContent]);

  const renderRecipientField = (
    label: string,
    recipientList: string[],
    currentValue: string,
    onChange: (value: string) => void,
    type: "to" | "cc" | "bcc"
  ) => (
    <div>
      <div className="flex flex-wrap items-center gap-2 w-full px-3 py-2 border-0 border-b focus-within:border-action">
        <span className="text-sm text-gray-500 min-w-[40px]">{label}:</span>
        {recipientList.map((email, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
          >
            <span>{email}</span>
            <button
              type="button"
              onClick={() => removeRecipient(index, type)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <input
          type="email"
          placeholder={
            recipientList.length > 0 ? "" : `Agregar ${label.toLowerCase()}`
          }
          className="flex-1 min-w-[120px] border-0 focus:ring-0 p-0"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, type)}
          onBlur={() => {
            if (currentValue.trim()) {
              addRecipient(type);
            }
          }}
        />
      </div>
    </div>
  );

  return (
    <div
      className={`
        fixed bottom-0 right-4 bg-white rounded-t-lg shadow-xl border border-b-0
        ${
          isMinimized
            ? "h-[48px]"
            : isMaximized
            ? "inset-4 rounded-lg border-b"
            : "w-[600px] h-[600px]"
        }
        transition-all duration-200 ease-in-out
        z-50
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 rounded-t-lg">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Form */}
          <div className="p-4 space-y-4">
            {/* Recipients */}
            {showToField &&
              renderRecipientField(
                "Para",
                recipients,
                currentInput,
                setCurrentInput,
                "to"
              )}

            {/* CC/BCC Toggle */}
            {!showCc && !showBcc && (
              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setShowCc(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  CC
                </button>
                <button
                  type="button"
                  onClick={() => setShowBcc(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  BCC
                </button>
              </div>
            )}

            {/* CC Field */}
            {showCc &&
              renderRecipientField(
                "CC",
                ccRecipients,
                currentCcInput,
                setCurrentCcInput,
                "cc"
              )}

            {/* BCC Field */}
            {showBcc &&
              renderRecipientField(
                "BCC",
                bccRecipients,
                currentBccInput,
                setCurrentBccInput,
                "bcc"
              )}

            <p className="text-xs text-gray-500 ml-3">
              Presiona Tab, coma o Enter para agregar múltiples destinatarios
            </p>

            {/* Subject */}
            <div>
              <input
                type="text"
                placeholder="Asunto"
                className="w-full px-3 py-2 border-0 border-b focus:ring-0 focus:border-action"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex justify-end mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHtmlView(!showHtmlView)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showHtmlView ? (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Vista Previa
                    </>
                  ) : (
                    <>
                      <Code className="w-4 h-4 mr-1" />
                      HTML
                    </>
                  )}
                </Button>
              </div>
              {showHtmlView ? (
                <textarea
                  className="w-full h-64 px-3 py-2 border rounded-md font-mono text-sm"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escribe tu HTML aquí..."
                />
              ) : (
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  className="h-64"
                  placeholder="Escribe tu mensaje aquí..."
                />
              )}
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Archivos adjuntos:</p>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm"
                    >
                      <File className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-700">{file.name}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickResponses(true)}
                  disabled={isSending}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleSend}
                disabled={
                  recipients.length === 0 || !subject || !content || isSending
                }
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        </>
      )}

      <QuickResponses
        isOpen={showQuickResponses}
        onClose={() => setShowQuickResponses(false)}
        onSelect={handleQuickResponseSelect}
      />
    </div>
  );
}
