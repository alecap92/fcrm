import React from "react";
import { Message } from "../../../types/chat";

interface ChatMessagesProps {
  chatId: string;
  messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ chatId, messages }) => {
  // Si no hay mensajes, mostrar un estado vacío
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">No hay mensajes en esta conversación</p>
      </div>
    );
  }

  // Función para obtener la fecha del timestamp
  const getDateFromTimestamp = (timestamp: any) => {
    if (timestamp && timestamp.$date) {
      return new Date(timestamp.$date);
    }
    return new Date(timestamp);
  };

  // Función para agrupar mensajes por día
  const groupMessagesByDay = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = getDateFromTimestamp(message.timestamp);
      const dateString = date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      groups[dateString].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDay(messages);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {Object.entries(messageGroups).map(([date, dayMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gray-200 px-4 py-1 rounded-full text-sm text-gray-600">
              {date}
            </div>
          </div>
          {dayMessages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.direction === "incoming"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.direction === "incoming"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-900"
                }`}
              >
                {message.mediaUrl && (
                  <div className="mb-2">
                    {message.mediaUrl.match(/\.(jpeg|jpg|gif|png|avif)$/i) ? (
                      <img
                        src={message.mediaUrl}
                        alt="Media"
                        className="rounded max-w-full h-auto"
                        style={{ maxWidth: "300px" }}
                      />
                    ) : message.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video controls className="rounded max-w-full h-auto">
                        <source src={message.mediaUrl} />
                        Tu navegador no soporta la reproducción de video.
                      </video>
                    ) : message.mediaUrl.match(/\.(mp3|wav)$/i) ? (
                      <audio controls className="max-w-full">
                        <source src={message.mediaUrl} />
                        Tu navegador no soporta la reproducción de audio.
                      </audio>
                    ) : (
                      <a
                        href={message.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white underline"
                      >
                        Ver archivo adjunto
                      </a>
                    )}
                  </div>
                )}
                <p className="whitespace-pre-wrap">
                  {message.mediaUrl ? "" : message.message}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    message.direction === "incoming"
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {getDateFromTimestamp(message.timestamp).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
