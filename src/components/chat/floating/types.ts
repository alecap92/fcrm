export interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  buttons?: ChatButton[];
}

export interface ChatButton {
  id: string;
  text: string;
  type: "action" | "gpt" | "suggestion";
  action?: () => void;
  variant?: "primary" | "secondary" | "outline";
}

export interface ChatState {
  isExpanded: boolean;
  messages: Message[];
  showTextInput: boolean;
  awaitingGptResponse: boolean;
}
