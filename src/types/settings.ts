export type SettingsSection = 
  | 'organization'
  | 'users'
  | 'contact-fields'
  | 'security'
  | 'integrations'
  | 'email'
  | 'invoice'
  | 'deals'
  | 'quotation';

export interface Organization {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  timezone: string;
  currency: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar: string;
  lastActive: string;
}

export interface ContactField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface WhatsAppConfig {
  provider: 'twilio' | 'messagebird' | '360dialog' | 'custom';
  accessToken: string;
  phoneNumber: string;
  webhookUrl?: string;
  apiEndpoint?: string;
  isActive: boolean;
}

export interface EmailConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'none' | 'ssl' | 'tls';
  fromName: string;
  fromEmail: string;
}

export interface InvoiceConfig {
  resolutionDate: string;
  resolutionNumber: string;
  prefix: string;
  technicalKey: string;
  from: number;
  to: number;
  dateFrom: string;
  dateTo: string;
  generatedToDate: number;
}

export interface QuotationConfig {
  quotationNumber: string;
  paymentTerms: string;
  shippingTerms: string;
  notes: string;
  bgImage: string;
  footerText: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineColumn {
  id: string;
  name: string;
  color: string;
  position: number;
  pipelineId: string;
}

export interface DealCustomField {
  id: string;
  key: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface DealsConfig {
  pipelines: Pipeline[];
  columns: PipelineColumn[];
  customFields: DealCustomField[];
}

export interface IntegrationProvider {
  id: string;
  name: string;
  type: 'whatsapp' | 'sms' | 'chatbot' | 'payment' | 'shipping' | 'other';
  description: string;
  icon: string;
  isConfigured: boolean;
  isActive: boolean;
  credentials: Record<string, string>;
  webhookUrl?: string;
  apiEndpoint?: string;
  settings?: Record<string, any>;
}

export interface IntegrationsConfig {
  providers: IntegrationProvider[];
}