import { DivideIcon as LucideIcon } from 'lucide-react';

interface EmailContact {
  name: string;
  email: string;
  avatar?: string;
}

interface EmailAttachment {
  name: string;
  size: number;
  type: string;
}

export interface Email {
  id: string;
  from: EmailContact;
  to: EmailContact[];
  subject: string;
  preview: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
  labels?: string[];
  folder: string;
}

export interface EmailFolder {
  id: string;
  name: string;
  icon: LucideIcon;
  count?: number;
}

export interface EmailLabel {
  id: string;
  name: string;
  color: string;
}