import { apiService } from "../config/apiConfig";
import type { Invoice } from "../types/invoice";

interface InvoiceResponse {
  invoices: Invoice[];
  totalPages: number;
  currentPage: number;
  totalInvoices: number;
}

interface ValidationError {
  field: string;
  message: string;
}

class InvoiceValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Invoice validation failed");
    this.name = "InvoiceValidationError";
  }
}

const validateInvoice = (invoice: Partial<Invoice>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!invoice.number?.trim()) {
    errors.push({ field: "number", message: "Invoice number is required" });
  }

  if (!invoice.date) {
    errors.push({ field: "date", message: "Invoice date is required" });
  }

  if (!invoice.customer?.email?.trim()) {
    errors.push({
      field: "customer.email",
      message: "Customer email is required",
    });
  }

  if (!Array.isArray(invoice.items) || invoice.items.length === 0) {
    errors.push({ field: "items", message: "At least one item is required" });
  }

  invoice.items?.forEach((item, index) => {
    if (!item.description?.trim()) {
      errors.push({
        field: `items[${index}].description`,
        message: "Item description is required",
      });
    }
    if (typeof item.quantity !== "number" || item.quantity <= 0) {
      errors.push({
        field: `items[${index}].quantity`,
        message: "Item quantity must be greater than 0",
      });
    }
    if (typeof item.unitPrice !== "number" || item.unitPrice < 0) {
      errors.push({
        field: `items[${index}].unitPrice`,
        message: "Item unit price must be greater than or equal to 0",
      });
    }
  });

  return errors;
};

const getInvoices = async (
  page: number = 1,
  limit: number = 10
): Promise<InvoiceResponse> => {
  try {
    const response = await apiService.get<InvoiceResponse>(
      `/invoices?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
};

const getInvoiceById = async (id: string): Promise<Invoice> => {
  try {
    const response = await apiService.get<Invoice>(`/invoices/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching invoice ${id}:`, error);
    throw error;
  }
};

const searchInvoices = async (search: string): Promise<InvoiceResponse> => {
  try {
    const response = await apiService.get<InvoiceResponse>(
      `/invoices/search?term=${encodeURIComponent(search)}`
    );
    return response;
  } catch (error) {
    console.error("Error searching invoices:", error);
    throw error;
  }
};

const createInvoice = async (
  invoice: Omit<Invoice, "_id" | "createdAt" | "updatedAt">
) => {
  try {
    const response = await apiService.post<Invoice>("/invoices", invoice);
    return response;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

const updateInvoice = async (id: string, invoice: Partial<Invoice>) => {
  try {
    const response = await apiService.put<Invoice>(`/invoices/${id}`, invoice);
    return response;
  } catch (error) {
    console.error(`Error updating invoice ${id}:`, error);
    throw error;
  }
};

const deleteInvoice = async (id: string) => {
  try {
    await apiService.delete(`/invoices/${id}`);
  } catch (error) {
    console.error(`Error deleting invoice ${id}:`, error);
    throw error;
  }
};

const bulkDeleteInvoices = async (ids: string[]) => {
  try {
    await apiService.delete("/invoices", { ids });
  } catch (error) {
    console.error("Error bulk deleting invoices:", error);
    throw error;
  }
};

const markAsPaid = async (
  id: string,
  paymentDetails: {
    method: string;
    date: string;
    amount: number;
    reference?: string;
  }
) => {
  try {
    const response = await apiService.put<Invoice>(
      `/invoices/${id}/mark-paid`,
      paymentDetails
    );
    return response;
  } catch (error) {
    console.error(`Error marking invoice ${id} as paid:`, error);
    throw error;
  }
};

const sendInvoice = async (
  id: string,
  emailData: {
    to: string;
    subject?: string;
    message?: string;
  }
) => {
  try {
    await apiService.post(`/invoices/${id}/send`, emailData);
  } catch (error) {
    console.error(`Error sending invoice ${id}:`, error);
    throw error;
  }
};

const downloadInvoice = async (id: string, format: "pdf" | "csv" = "pdf") => {
  try {
    const response = await apiService.get(
      `/invoices/${id}/download?format=${format}`
    );
    return response;
  } catch (error) {
    console.error(`Error downloading invoice ${id}:`, error);
    throw error;
  }
};

const getInvoicesByCustomer = async (
  customerId: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await apiService.get<InvoiceResponse>(
      `/invoices/customer/${customerId}?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error(`Error fetching invoices for customer ${customerId}:`, error);
    throw error;
  }
};

const getInvoicesByDateRange = async (
  startDate: string,
  endDate: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await apiService.get<InvoiceResponse>(
      `/invoices/date-range?start=${startDate}&end=${endDate}&page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching invoices by date range:", error);
    throw error;
  }
};

const getOverdueInvoices = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await apiService.get<InvoiceResponse>(
      `/invoices/overdue?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching overdue invoices:", error);
    throw error;
  }
};

const invoiceService = {
  getInvoices,
  getInvoiceById,
  searchInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  bulkDeleteInvoices,
  markAsPaid,
  sendInvoice,
  downloadInvoice,
  getInvoicesByCustomer,
  getInvoicesByDateRange,
  getOverdueInvoices,
};

export default invoiceService;
