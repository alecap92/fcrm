import React from "react";
import { useChatContext } from "./context/ChatContext";

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  onSuggestionClick,
}) => {
  // Eliminamos las sugerencias ya que el contenido se pasará dentro de los mensajes
  return null;
};
