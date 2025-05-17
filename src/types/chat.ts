export interface Chat {
  _id: string;
  contact: string;
  name: string;
  contactId?: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  possibleName: string;
}

export interface Message {
  _id: string;
  user: string;
  organization: string;
  from: string;
  to: string;
  message: string;
  mediaUrl: string | null;
  mediaId: string;
  timestamp: string;
  type: string;
  direction: "incoming" | "outgoing";
  isRead: boolean;
  possibleName: string;
  replyToMessage: string | null;
  messageId: string;
  reactions: any[];
  conversation: string;
}

export interface QuickResponse {
  id: string;
  title: string;
  content: string;
}

export interface Deal {
  id: string;
  name: string;
  value: number;
  stage: string;
  createdAt: string;
}
