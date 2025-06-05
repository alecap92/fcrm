import React from "react";
import { MessageSquare, Lightbulb, Zap, HelpCircle } from "lucide-react";
import { ChatButton } from "./types";

interface ChatButtonsProps {
  buttons: ChatButton[];
  onButtonClick: (button: ChatButton) => void;
}

export const ChatButtons: React.FC<ChatButtonsProps> = ({
  buttons,
  onButtonClick,
}) => {
  const getButtonIcon = (type: ChatButton["type"]) => {
    switch (type) {
      case "gpt":
        return <MessageSquare size={14} />;
      case "suggestion":
        return <Lightbulb size={14} />;
      case "action":
        return <Zap size={14} />;
      default:
        return <HelpCircle size={14} />;
    }
  };

  const getButtonStyles = (variant: ChatButton["variant"] = "secondary") => {
    const baseStyles =
      "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors";

    switch (variant) {
      case "primary":
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700`;
      case "outline":
        return `${baseStyles} border border-gray-300 text-gray-700 hover:bg-gray-50`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-700 hover:bg-gray-200`;
    }
  };

  if (buttons.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={() => onButtonClick(button)}
          className={getButtonStyles(button.variant)}
        >
          {getButtonIcon(button.type)}
          {button.text}
        </button>
      ))}
    </div>
  );
};
