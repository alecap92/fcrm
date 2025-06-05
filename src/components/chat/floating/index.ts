export { FloatingChat } from "./FloatingChat";
export { ChatWindow } from "./ChatWindow";
export { ChatHeader } from "./ChatHeader";
export { ChatMessage } from "./ChatMessage";
export { ChatInput } from "./ChatInput";
export { TypingIndicator } from "./TypingIndicator";
export { ChatSuggestions } from "./ChatSuggestions";
export { ChatButtons } from "./ChatButtons";
export { useChatLogic } from "./hooks/useChatLogic";
export { useChatModule } from "./hooks/useChatModule";
export { ChatProvider, useChatContext } from "./context/ChatContext";
export { ChatResponseService } from "./services/ChatResponseService";
export { GPTService } from "./services/GPTService";
export { KeywordDetectionService } from "./services/KeywordDetectionService";
export type { Message, ChatState, ChatButton } from "./types";
export type {
  ModuleType,
  ChatContextData,
  ChatSuggestion,
} from "./context/ChatContext";
export type { ChatResponse } from "./services/ChatResponseService";
