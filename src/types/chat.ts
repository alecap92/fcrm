export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'me' | 'them';
  status: 'sent' | 'delivered' | 'read';
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