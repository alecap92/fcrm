import { create } from 'zustand';
import type { Invoice, InvoiceFilter } from '../types/invoice';
import invoiceService from '../services/invoiceService';
import { invoiceConfigService } from '../services/invoiceConfigService';
import type { IInvoiceConfig } from '../types/invoiceConfig'; 

interface InvoiceState {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  filters: InvoiceFilter;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalInvoices: number;
  invoiceConfig: IInvoiceConfig | null;

  // Actions
  setInvoices: (invoices: Invoice[]) => void;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  setFilters: (filters: InvoiceFilter) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (totalPages: number, currentPage: number, totalInvoices: number) => void;
  setInvoiceConfig: (config: IInvoiceConfig) => void;

  // CRUD Operations
  fetchInvoices: (page?: number, limit?: number) => Promise<void>;
  getInvoiceById: (id: string) => Promise<void>;
  createInvoice: (invoice: Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  bulkDeleteInvoices: (ids: string[]) => Promise<void>;
  markAsPaid: (id: string, paymentDetails: { method: string; date: string; amount: number; reference?: string }) => Promise<void>;
  sendInvoice: (id: string, emailData: { to: string; subject?: string; message?: string }) => Promise<void>;
  downloadInvoice: (id: string, format?: "pdf" | "csv") => Promise<void>;
  searchInvoices: (search: string) => Promise<void>;
  getInvoicesByCustomer: (customerId: string, page?: number, limit?: number) => Promise<void>;
  getInvoicesByDateRange: (startDate: string, endDate: string, page?: number, limit?: number) => Promise<void>;
  getOverdueInvoices: (page?: number, limit?: number) => Promise<void>;
  
  // Configuración de factura
  fetchInvoiceConfig: () => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  selectedInvoice: null,
  filters: {},
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  totalInvoices: 0,
  invoiceConfig: null,

  setInvoices: (invoices) => set({ invoices }),
  setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),
  setFilters: (filters) => set({ filters }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPagination: (totalPages, currentPage, totalInvoices) => 
    set({ totalPages, currentPage, totalInvoices }),
  setInvoiceConfig: (config) => set({ invoiceConfig: config }),

  fetchInvoices: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      // Usar any temporalmente para evitar errores de tipo 
      // hasta revisar la estructura completa de la API
      const response: any = await invoiceService.getInvoices(page, limit);
      
      set({ 
        invoices: response.invoices || [], 
        totalPages: response.totalPages || 0, 
        currentPage: response.currentPage || 1, 
        totalInvoices: response.totalInvoices || 0,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al cargar las facturas',
        isLoading: false 
      });
    }
  },

  getInvoiceById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const invoice = await invoiceService.getInvoiceById(id);
      set({ selectedInvoice: invoice, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al obtener la factura',
        isLoading: false 
      });
    }
  },

  createInvoice: async (invoice) => {
    try {
      set({ isLoading: true, error: null });
      const newInvoice = await invoiceService.createInvoice(invoice);
      set((state) => ({ 
        invoices: [...state.invoices, newInvoice],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al crear la factura',
        isLoading: false 
      });
    }
  },

  updateInvoice: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      const updatedInvoice = await invoiceService.updateInvoice(id, updates);
      set((state) => ({
        invoices: state.invoices.map((invoice) =>
          invoice._id === id ? updatedInvoice : invoice
        ),
        selectedInvoice: state.selectedInvoice?._id === id ? updatedInvoice : state.selectedInvoice,
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al actualizar la factura',
        isLoading: false 
      });
    }
  },

  deleteInvoice: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await invoiceService.deleteInvoice(id);
      set((state) => ({
        invoices: state.invoices.filter((invoice) => invoice._id !== id),
        selectedInvoice: state.selectedInvoice?._id === id ? null : state.selectedInvoice,
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al eliminar la factura',
        isLoading: false 
      });
    }
  },

  bulkDeleteInvoices: async (ids) => {
    try {
      set({ isLoading: true, error: null });
      await invoiceService.bulkDeleteInvoices(ids);
      set((state) => ({
        invoices: state.invoices.filter((invoice) => !ids.includes(invoice._id)),
        selectedInvoice: state.selectedInvoice && ids.includes(state.selectedInvoice._id) 
          ? null 
          : state.selectedInvoice,
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al eliminar las facturas',
        isLoading: false 
      });
    }
  },

  markAsPaid: async (id, paymentDetails) => {
    try {
      set({ isLoading: true, error: null });
      const updatedInvoice = await invoiceService.markAsPaid(id, paymentDetails);
      set((state) => ({
        invoices: state.invoices.map((invoice) =>
          invoice._id === id ? updatedInvoice : invoice
        ),
        selectedInvoice: state.selectedInvoice?._id === id ? updatedInvoice : state.selectedInvoice,
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al marcar la factura como pagada',
        isLoading: false 
      });
    }
  },

  sendInvoice: async (id, emailData) => {
    try {
      set({ isLoading: true, error: null });
      await invoiceService.sendInvoice(id, emailData);
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al enviar la factura',
        isLoading: false 
      });
    }
  },

  downloadInvoice: async (id, format = "pdf") => {
    try {
      set({ isLoading: true, error: null });
      await invoiceService.downloadInvoice(id, format);
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al descargar la factura',
        isLoading: false 
      });
    }
  },

  searchInvoices: async (search) => {
    try {
      set({ isLoading: true, error: null });
      const response: any = await invoiceService.searchInvoices(search);
      set({ 
        invoices: response.invoices || [], 
        totalPages: response.totalPages || 0, 
        currentPage: response.currentPage || 1, 
        totalInvoices: response.totalInvoices || 0,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al buscar facturas',
        isLoading: false 
      });
    }
  },

  getInvoicesByCustomer: async (customerId, page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response: any = await invoiceService.getInvoicesByCustomer(customerId, page, limit);
      set({ 
        invoices: response.invoices || [], 
        totalPages: response.totalPages || 0, 
        currentPage: response.currentPage || 1, 
        totalInvoices: response.totalInvoices || 0,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || `Error al obtener facturas del cliente ${customerId}`,
        isLoading: false 
      });
    }
  },

  getInvoicesByDateRange: async (startDate, endDate, page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response: any = await invoiceService.getInvoicesByDateRange(startDate, endDate, page, limit);
      set({ 
        invoices: response.invoices || [], 
        totalPages: response.totalPages || 0, 
        currentPage: response.currentPage || 1, 
        totalInvoices: response.totalInvoices || 0,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al obtener facturas por rango de fechas',
        isLoading: false 
      });
    }
  },

  getOverdueInvoices: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response: any = await invoiceService.getOverdueInvoices(page, limit);
      set({ 
        invoices: response.invoices || [], 
        totalPages: response.totalPages || 0, 
        currentPage: response.currentPage || 1, 
        totalInvoices: response.totalInvoices || 0,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al obtener facturas vencidas',
        isLoading: false 
      });
    }
  },

  // Obtener la configuración de factura
  fetchInvoiceConfig: async () => {
    try {
      set({ isLoading: true, error: null });
      const config = await invoiceConfigService.getInvoiceConfig();
      console.log("Configuración de factura:", config);
      set({ 
        invoiceConfig: config, 
        isLoading: false 
      });
      return config;
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al obtener la configuración de facturación',
        isLoading: false 
      });
      return null;
    }
  },
}));
