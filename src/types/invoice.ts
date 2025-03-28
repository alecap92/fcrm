interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  name: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
    taxId?: string;
  };
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
  status?: Invoice['status'][];
  dateRange?: {
    start: string;
    end: string;
  };
  customer?: string;
  minAmount?: number;
  maxAmount?: number;
}