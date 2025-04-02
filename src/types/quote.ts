import { Contact } from "./contact";

export interface QuoteItem {
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

export interface Quote {
  _id?: string;
  quotationNumber: string;
  expirationDate: string;
  name: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "canceled" | "expired";
  contact: Contact;
  contactId?: any;
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
