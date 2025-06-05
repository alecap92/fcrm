import React from "react";
import { Message, ChatButton } from "./types";
import { Bot, User } from "lucide-react";
import { ChatButtons } from "./ChatButtons";

interface ChatMessageProps {
  message: Message;
  onButtonClick?: (button: ChatButton) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onButtonClick,
}) => {
  const isAssistant = message.sender === "assistant";

  return (
    <div
      className={`flex gap-2 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Bot size={16} className="text-blue-600" />
        </div>
      )}

      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isAssistant ? "bg-gray-100 text-gray-800" : "bg-blue-600 text-white"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <span
          className={`text-xs mt-1 block ${
            isAssistant ? "text-gray-500" : "text-blue-100"
          }`}
        >
          {message.timestamp.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>

        {/* Botones solo para mensajes del asistente */}
        {isAssistant && message.buttons && onButtonClick && (
          <ChatButtons
            buttons={message.buttons}
            onButtonClick={onButtonClick}
          />
        )}
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
      )}
    </div>
  );
};
