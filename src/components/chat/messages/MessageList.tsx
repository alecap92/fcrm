import { Message } from "../../../types/chat";
import { useEffect, useRef, useState } from "react";
import {
  formatTime,
  isIncomingMessage,
  getMessageMediaUrl,
} from "../../../lib";
import { useChatContext } from "../../../contexts/ChatContext";
import { ImagePreviewModal } from "./ImagePreviewModal";

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

  return (
    <div
      ref={messageListRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      onScroll={handleScroll}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d1d5db' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }}
    >
      {isLoading && (
        <div className="text-center py-2">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-action"></div>
        </div>
      )}

      {groupedMessages.map((group) => (
        <div key={group.date} className="space-y-4">
          <div className="flex justify-center">
            <div className="px-3 py-1 rounded-full bg-action/5 text-sm text-action/80 font-medium">
              {group.date}
            </div>
          </div>

          {group.messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                isIncomingMessage(message) ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`
                  max-w-[70%] rounded-2xl px-4 py-2.5 
                  ${
                    isIncomingMessage(message)
                      ? "bg-[#f1f1f1] text-gray-900 shadow-md"
                      : "bg-action text-white shadow-lg shadow-action/20"
                  }
                `}
              >
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
                  <div className="mt-2">
                    <iframe
                      src={getMessageMediaUrl(message)!}
                      className="w-full rounded-xl border border-gray-100 shadow-sm"
                      style={{ height: "300px", maxWidth: "300px" }}
                      title="Documento PDF"
                    ></iframe>
                  </div>
                ) : message.type === "audio" && getMessageMediaUrl(message) ? (
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
                    flex items-center gap-1 text-xs mt-1.5
                    ${
                      isIncomingMessage(message)
                        ? "text-gray-500"
                        : "text-white/90"
                    }
                  `}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      <ImagePreviewModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
      />
    </div>
  );
}
