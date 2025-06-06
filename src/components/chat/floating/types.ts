export interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  buttons?: ChatButton[];
  variant?: "default" | "warning" | "info";
  icon?: string;
}

export interface ChatButton {
  id: string;
  text: string;
  type: "action" | "gpt" | "suggestion";
  variant?: "primary" | "secondary" | "outline";
  action?: () => void;
  icon?: string;
}

export interface ChatState {
  isExpanded: boolean;
  messages: Message[];
  showTextInput: boolean;
  awaitingGptResponse: boolean;
}
