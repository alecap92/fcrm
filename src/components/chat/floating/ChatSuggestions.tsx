import React from "react";
import { useChatContext } from "./context/ChatContext";

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  onSuggestionClick,
}) => {
  const { suggestions, contextData } = useChatContext();

  if (suggestions.length === 0) return null;

  return (
    <div className="p-3 border-t border-gray-200 bg-gray-50">
      <div className="text-xs text-gray-600 mb-2">
        {contextData
          ? `Sugerencias para ${contextData.module}:`
          : "Sugerencias:"}
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.slice(0, 3).map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => {
              if (suggestion.action) {
                suggestion.action();
              } else {
                onSuggestionClick(suggestion.text);
              }
            }}
            className="text-xs bg-white border border-gray-300 rounded-full px-3 py-1 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            {suggestion.text}
          </button>
        ))}
      </div>
    </div>
  );
};
