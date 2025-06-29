import React from "react";
import { Message, ChatButton } from "./types";
import { AlertTriangle, Bot, User } from "lucide-react";
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
  const isWarning = message.variant === "warning";

  return (
    <div
      className={`flex gap-2 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant && !isWarning && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Bot size={16} className="text-blue-600" />
        </div>
      )}
      {isWarning && (
        <div className="flex-shrink-0 w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
          <AlertTriangle size={18} className="text-yellow-600" />
        </div>
      )}
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isWarning
            ? "bg-yellow-100 text-yellow-900 border border-yellow-300 flex items-center gap-2"
            : isAssistant
            ? "bg-gray-100 text-gray-800"
            : "bg-blue-600 text-white"
        }`}
      >
        {!isWarning && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
        {isWarning && (
          <span className="text-sm leading-relaxed font-medium flex items-center gap-2 whitespace-pre-wrap break-words">
            {message.content}
          </span>
        )}
        <span
          className={`text-xs mt-1 block ${
            isAssistant || isWarning ? "text-gray-500" : "text-blue-100"
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
      {!isAssistant && !isWarning && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
      )}
    </div>
  );
};
