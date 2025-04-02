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
