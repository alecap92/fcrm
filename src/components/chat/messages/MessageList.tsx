import { Message } from "../../../types/chat";
import { useEffect, useRef, useState } from "react";
import {
  formatTime,
  isIncomingMessage,
  getMessageMediaUrl,
} from "../../../lib";
import { useChatContext } from "../../../contexts/ChatContext";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { Download, FileText } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  isInitialLoad: boolean;
}

export function MessageList({
  messages,
  onLoadMore,
  isLoading,
  hasMore,
  isInitialLoad,
}: MessageListProps) {
  const messageListRef = useRef<HTMLDivElement>(null);
  const { groupedMessages } = useChatContext();
  const prevMessagesLengthRef = useRef<number>(messages.length);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  console.log(messages, 1);
  const handleScroll = () => {
    if (!messageListRef.current) return;

    const { scrollTop } = messageListRef.current;

    // Si el scroll está cerca del top, cargamos más mensajes
    if (scrollTop < 100 && hasMore && !isLoading) {
      onLoadMore();
    }
  };

  // Scroll al final cuando se carga inicialmente
  useEffect(() => {
    if (messageListRef.current && isInitialLoad && messages.length > 0) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [isInitialLoad, messages.length]);

  // Mantener la posición del scroll cuando se cargan más mensajes antiguos
  useEffect(() => {
    if (
      !isInitialLoad &&
      messages.length > prevMessagesLengthRef.current &&
      messageListRef.current
    ) {
      // Si hemos cargado más mensajes (scroll hacia arriba para cargar antiguos)
      const scrollHeightBefore = messageListRef.current.scrollHeight;

      // Esperamos a que el DOM se actualice
      setTimeout(() => {
        if (messageListRef.current) {
          const newScrollHeight = messageListRef.current.scrollHeight;
          messageListRef.current.scrollTop =
            newScrollHeight - scrollHeightBefore;
        }
      }, 10);
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages.length, isInitialLoad]);

  // Scroll al final cuando llegan mensajes nuevos
  useEffect(() => {
    if (!isInitialLoad && messageListRef.current && messages.length > 0) {
      // Verificar si el último mensaje es reciente (menos de 5 segundos)
      const lastMessage = messages[messages.length - 1];
      const now = new Date().getTime();
      const messageTime = new Date(lastMessage.timestamp).getTime();
      const timeDiff = now - messageTime;

      // Si el mensaje es muy reciente, hacer scroll al final
      if (timeDiff < 5000) {
        setTimeout(() => {
          if (messageListRef.current) {
            messageListRef.current.scrollTop =
              messageListRef.current.scrollHeight;
          }
        }, 100);
      }
    }
  }, [messages, isInitialLoad]);

  // Función para obtener el nombre del archivo de una URL
  const getFileNameFromUrl = (url: string) => {
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  // Detecta si una URL apunta a un PDF (por extensión)
  const isPdfUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
      const cleanUrl = url.split("?")[0].split("#")[0];
      return /\.pdf$/i.test(cleanUrl);
    } catch {
      return false;
    }
  };

  // Función para obtener una previsualización del mensaje al que se responde
  const getRepliedMessagePreview = (replyId: string): string | null => {
    const replied = messages.find((msg) => msg._id === replyId);
    if (!replied) return null;

    switch (replied.type) {
      case "text":
        return replied.message;
      case "image":
        return "📷 Imagen";
      case "document":
        return "📄 Documento";
      case "audio":
        return "🎵 Audio";
      default:
        return "Mensaje";
    }
  };

  return (
    <>
      <div
        ref={messageListRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d1d5db' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      >
        {isLoading && hasMore && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span className="ml-2 text-sm text-gray-600">
              Cargando mensajes...
            </span>
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.date} className="space-y-4">
            <div className="text-center">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {group.date}
              </span>
            </div>

            {group.messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  isIncomingMessage(message) ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isIncomingMessage(message)
                      ? "bg-gray-100"
                      : "bg-action text-white"
                  }`}
                >
                  {/* Vista previa del mensaje al que se responde */}
                  {message.replyToMessage && (
                    <div
                      className={`mb-2 border-l-2 pl-2 text-xs italic ${
                        isIncomingMessage(message)
                          ? "border-gray-400 text-gray-600"
                          : "border-white/60 text-white/80"
                      }`}
                    >
                      {getRepliedMessagePreview(message.replyToMessage) ||
                        "Mensaje no disponible"}
                    </div>
                  )}
                  {message.type === "image" && getMessageMediaUrl(message) ? (
                    <img
                      src={getMessageMediaUrl(message)!}
                      alt="Imagen del mensaje"
                      className="w-full rounded-xl shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ maxWidth: "300px" }}
                      onClick={() =>
                        setSelectedImage(getMessageMediaUrl(message)!)
                      }
                    />
                  ) : message.type === "document" &&
                    getMessageMediaUrl(message) ? (
                    <div className="mt-2 space-y-2">
                      <div className="rounded-lg overflow-hidden bg-white shadow-sm border border-gray-200">
                        <object
                          data={getMessageMediaUrl(message)!}
                          type="application/pdf"
                          width="220"
                          height="280"
                          className="block"
                        >
                          <div className="flex flex-col items-center justify-center w-[220px] h-[280px] text-gray-500 gap-2">
                            <FileText className="w-8 h-8" />
                            <span className="text-xs">
                              No se pudo mostrar la vista previa
                            </span>
                          </div>
                        </object>
                      </div>

                      <a
                        href={getMessageMediaUrl(message)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={getFileNameFromUrl(
                          getMessageMediaUrl(message)!
                        )}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                          isIncomingMessage(message)
                            ? "bg-white hover:bg-gray-50 text-gray-800"
                            : "bg-action-dark hover:bg-action-darker text-white"
                        }`}
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm truncate max-w-[240px]">
                          {getFileNameFromUrl(getMessageMediaUrl(message)!)}
                        </span>
                      </a>
                    </div>
                  ) : message.type === "audio" &&
                    getMessageMediaUrl(message) ? (
                    <div className="mt-2">
                      <audio
                        controls
                        src={getMessageMediaUrl(message)!}
                        className="rounded-lg shadow-sm"
                        style={{ maxWidth: "1000px" }}
                      >
                        Tu navegador no soporta el elemento de audio.
                      </audio>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.message}</p>
                  )}
                  <div
                    className={`
                      flex items-center gap-2 text-xs mt-1.5
                      ${
                        isIncomingMessage(message)
                          ? "text-gray-500"
                          : "text-white/90"
                      }
                    `}
                  >
                    {formatTime(message.timestamp)}
                    {/* Estado de envío para mensajes salientes */}
                    {!isIncomingMessage(message) && (
                      <span>
                        {message.status === "queued" && "⏳"}
                        {message.status === "sending" && (
                          <span className="inline-block w-3 h-3 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                        )}
                        {message.status === "sent" && "✔️"}
                        {message.status === "error" && "⚠️"}
                      </span>
                    )}
                  </div>
                </div>
                {/* Eliminamos la visualización del ID de replyToMessage fuera del bubble */}
              </div>
            ))}
          </div>
        ))}
      </div>

      <ImagePreviewModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
      />
    </>
  );
}
