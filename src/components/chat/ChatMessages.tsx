import React from "react";
import { Message } from "../../types/chat";

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

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.map((message) => (
        <div
          key={message._id}
          className={`flex ${
            message.direction === "outgoing" ? "justify-end" : "justify-start"
          }`}
        >
          {console.log(message) as any}
          <div
            className={`max-w-[70%] rounded-lg p-3 ${
              message.direction === "outgoing"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-900"
            }`}
          >
            {message.mediaUrl && (
              <div className="mb-2">
                {message.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                  <img
                    src={message.mediaUrl}
                    alt="Media"
                    className="rounded max-w-full h-auto"
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
                    className="text-blue-500 underline"
                  >
                    Ver archivo adjunto
                  </a>
                )}
              </div>
            )}
            <p className="whitespace-pre-wrap">{message.message}</p>
            <p
              className={`text-xs mt-1 ${
                message.direction === "outgoing"
                  ? "text-blue-100"
                  : "text-gray-500"
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
