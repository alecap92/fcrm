import { Contact, IContact } from "./contact";

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Quote {
  _id: string;
  quotationNumber: string;
  expirationDate: string;
  name: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "canceled" | "expired";
  contactId: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    companyName?: string;
  };
  items: QuoteItem[];
  subtotal: number;
  total: number;
  taxes: number;
  discount: number;
  observaciones: string;
  paymentTerms: string;
  shippingTerms: string;
  creationDate: string;
  lastModified: string;
  optionalItems: [];
  userId: string;
}

interface QuoteFilter {
  search?: string;
  status?: Quote["status"][];
  dateRange?: {
    start: string;
    end: string;
  };
  customer?: string;
}
