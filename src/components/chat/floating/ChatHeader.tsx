import React from "react";
import { X, Bot, RotateCcw } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
  onClearConversation: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose,
  onClearConversation,
}) => {
  return (
    <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bot size={20} />
        <h3 className="font-semibold">Asistente FusionCRM</h3>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onClearConversation}
          className="hover:bg-blue-700 p-1 rounded transition-colors"
          aria-label="Limpiar conversación"
          title="Limpiar conversación"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={onClose}
          className="hover:bg-blue-700 p-1 rounded transition-colors"
          aria-label="Cerrar chat"
          title="Cerrar chat"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
