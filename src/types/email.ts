import { LucideIcon } from "lucide-react";

// Interfaces básicas
export interface EmailContact {
  name: string;
  email: string;
  avatar?: string;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size?: number;
  partID?: string;
}

export interface Email {
  _id: string;
  uid: number;
  userId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  date: string;
  attachments?: EmailAttachment[];
  contactId?: string;
  folder: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  labels: string[];
  threadId?: string;
  inReplyTo?: string;
  messageId: string;
  priority: "low" | "normal" | "high";
  flags: string[];
  size?: number;
  snippet?: string;
  hasAttachments: boolean;
  isEncrypted: boolean;
  spamScore?: number;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailFolder {
  id: string;
  name: string;
  icon: LucideIcon;
  count?: number;
  unreadCount?: number;
}

export interface EmailLabel {
  id: string;
  name: string;
  color: string;
  count?: number;
}

// Configuraciones de email
export interface ImapSettings {
  host: string;
  port: number;
  user: string;
  password: string;
  tls: boolean;
  lastUID?: number;
}

export interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  password: string;
  secure: boolean;
}

export interface EmailSettings {
  emailAddress: string;
  imapSettings: ImapSettings;
  smtpSettings: SmtpSettings;
}

// Interfaces para operaciones
export interface EmailSearchQuery {
  text?: string;
  from?: string;
  to?: string;
  subject?: string;
  folder?: string;
  isRead?: boolean;
  isStarred?: boolean;
  hasAttachments?: boolean;
  labels?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  priority?: "low" | "normal" | "high";
}

export interface EmailFilters {
  folder: string;
  isRead?: boolean;
  isStarred?: boolean;
  hasAttachments?: boolean;
  labels?: string[];
  priority?: "low" | "normal" | "high";
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface EmailCompose {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  content: string;
  attachments?: File[];
  priority?: "low" | "normal" | "high";
  inReplyTo?: string;
  threadId?: string;
}

export interface EmailThread {
  threadId: string;
  emails: Email[];
  participants: EmailContact[];
  subject: string;
  lastActivity: string;
  unreadCount: number;
}

export interface EmailStats {
  totalEmails: number;
  unreadEmails: number;
  usedStorage: number;
  todayEmails: number;
  weekEmails: number;
}

export interface BulkEmailOperation {
  emailIds: string[];
  action:
    | "markAsRead"
    | "markAsUnread"
    | "delete"
    | "moveToFolder"
    | "addLabel"
    | "removeLabel";
  folder?: string;
  label?: string;
}

// Estados de la aplicación
export interface EmailState {
  emails: Email[];
  selectedEmail: Email | null;
  selectedEmails: string[];
  folders: EmailFolder[];
  labels: EmailLabel[];
  currentFolder: string;
  searchQuery: string;
  filters: EmailFilters;
  isLoading: boolean;
  isComposing: boolean;
  emailSettings: EmailSettings | null;
  stats: EmailStats | null;
  threads: EmailThread[];
  currentThread: EmailThread | null;
}

// Acciones del contexto
export type EmailAction =
  | { type: "SET_EMAILS"; payload: Email[] }
  | { type: "ADD_EMAIL"; payload: Email }
  | { type: "UPDATE_EMAIL"; payload: { id: string; updates: Partial<Email> } }
  | { type: "DELETE_EMAIL"; payload: string }
  | { type: "SELECT_EMAIL"; payload: Email | null }
  | { type: "SELECT_EMAILS"; payload: string[] }
  | { type: "SET_FOLDERS"; payload: EmailFolder[] }
  | { type: "SET_LABELS"; payload: EmailLabel[] }
  | { type: "SET_CURRENT_FOLDER"; payload: string }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_FILTERS"; payload: EmailFilters }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_COMPOSING"; payload: boolean }
  | { type: "SET_EMAIL_SETTINGS"; payload: EmailSettings | null }
  | { type: "SET_STATS"; payload: EmailStats }
  | { type: "SET_THREADS"; payload: EmailThread[] }
  | { type: "SET_CURRENT_THREAD"; payload: EmailThread | null }
  | {
      type: "BULK_UPDATE_EMAILS";
      payload: { emailIds: string[]; updates: Partial<Email> };
    };

// Configuración de proveedores de email
export interface EmailProvider {
  name: string;
  domain: string;
  imapSettings: Omit<ImapSettings, "user" | "password">;
  smtpSettings: Omit<SmtpSettings, "user" | "password">;
  requiresAppPassword?: boolean;
  setupInstructions?: string;
}

export const EMAIL_PROVIDERS: EmailProvider[] = [
  {
    name: "Gmail",
    domain: "gmail.com",
    imapSettings: {
      host: "imap.gmail.com",
      port: 993,
      tls: true,
    },
    smtpSettings: {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
    },
    requiresAppPassword: true,
    setupInstructions:
      "Necesitas generar una contraseña de aplicación en tu cuenta de Google.",
  },
  {
    name: "Outlook",
    domain: "outlook.com",
    imapSettings: {
      host: "outlook.office365.com",
      port: 993,
      tls: true,
    },
    smtpSettings: {
      host: "smtp-mail.outlook.com",
      port: 587,
      secure: false,
    },
  },
  {
    name: "Yahoo",
    domain: "yahoo.com",
    imapSettings: {
      host: "imap.mail.yahoo.com",
      port: 993,
      tls: true,
    },
    smtpSettings: {
      host: "smtp.mail.yahoo.com",
      port: 587,
      secure: false,
    },
    requiresAppPassword: true,
  },
];

// Utilidades de tipos
export type EmailSortBy = "date" | "from" | "subject" | "size";
export type EmailSortOrder = "asc" | "desc";

export interface EmailPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
