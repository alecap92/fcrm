import React, { useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { ChatSuggestions } from "./ChatSuggestions";
import { useChatLogic } from "./hooks/useChatLogic";

interface ChatWindowProps {
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const {
    messages,
    isTyping,
    showTextInput,
    sendMessage,
    handleButtonClick,
    clearMessages,
  } = useChatLogic();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleClearConversation = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres limpiar toda la conversación?"
      )
    ) {
      clearMessages();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl w-[400px] h-[600px] flex flex-col border border-gray-200">
      <ChatHeader
        onClose={onClose}
        onClearConversation={handleClearConversation}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onButtonClick={handleButtonClick}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <ChatSuggestions onSuggestionClick={sendMessage} />
      {showTextInput && <ChatInput onSendMessage={sendMessage} />}
    </div>
  );
};
