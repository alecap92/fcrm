export type SettingsSection =
  | "organization"
  | "users"
  | "contact-fields"
  | "security"
  | "integrations"
  | "email"
  | "invoice"
  | "deals"
  | "quotation";

export interface Organization {
  _id?: string;
  address: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  companyName: string;
  contactProperties: ContactField[];
  email: string;
  idNumber: string;
  idType: string;
  logoUrl: string;
  phone: string;
  settings: IOrganizationSettings;
  whatsapp: string;
  createdAt: string;
  updatedAt: string;
  employees: User[];
}

export interface IOrganizationSettings {
  formuapp: any;
  googleMaps: any;
  masiveEmails: any;
  purchases: any;
  quotations: QuotationConfig;
  whatsapp: any;
  invoiceSettings: InvoiceConfig;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
}

export interface ContactField {
  _id?: string;
  label: string;
  key: string;
  isVisible: boolean;
}

export interface WhatsAppConfig {
  provider: "twilio" | "messagebird" | "360dialog" | "custom";
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
  encryption: "none" | "ssl" | "tls";
  fromName: string;
  fromEmail: string;
}

export interface InvoiceConfig {
  type_document_id: number;
  prefix: string;
  resolution: number;
  resolution_date: string;
  technical_key: string;
  from: number;
  to: number;
  generated_to_date: number;
  date_from: string;
  date_to: string;
}

export interface QuotationConfig {
  quotationNumber: string;
  paymentTerms: [string];
  shippingTerms: [string];
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
  type: "text" | "number" | "date" | "select" | "checkbox";
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
  _id: string;
  name: string;
  service: "whatsapp" | "chatgpt" | "formuapp";
  isActive: boolean;
  credentials: Record<string, string>;
  organizationId?: string;
}

export interface IntegrationsConfig {
  providers: IntegrationProvider[];
}
