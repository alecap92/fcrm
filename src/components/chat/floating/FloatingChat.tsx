import React, { useState } from "react";
import { ChatWindow } from "./ChatWindow";
import { MessageCircle } from "lucide-react";

export const FloatingChat: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleChat = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <ChatWindow onClose={() => setIsExpanded(false)} />
      ) : (
        <button
          onClick={toggleChat}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 min-w-[180px] justify-center"
        >
          <MessageCircle size={20} />
          <span className="font-medium">Asistente FusionCRM</span>
        </button>
      )}
    </div>
  );
};
