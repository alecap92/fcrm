import { Contact } from "./contact";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxes: number;
  total: number;
  name: string;
  imageUrl: string;
}

export interface Invoice {
  _id: string;
  number: string;
  date: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  customer: Contact;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  terms?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFilter {
  search?: string;
  status?: Invoice["status"][];
  dateRange?: {
    start: string;
    end: string;
  };
  customer?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface InvoiceConfig {
  type_document_identification_id: number;
  type_organization_id: number;
  type_regime_id: number;
  type_liability_id: number;
  business_name: string;
  merchant_registration: string;
  municipality_id: number;
  address: string;
  phone: number;
  email: string;
  mail_host: string;
  mail_port: string;
  mail_username: string;
  mail_password: string;
  mail_encryption: string;
  verification_number: string;
  id_number: string;
}

export interface VerificationData {
  id: string;
  pin: number;
}

export interface CertificateData {
  certificate: File | null;
  password: string;
}

export interface ResolutionData {
  type_document_id: number;
  prefix: string;
  resolution: string;
  resolution_date: string;
  technical_key: string;
  from: number;
  to: number;
  generated_to_date: number;
  date_from: string;
  date_to: string;
}
