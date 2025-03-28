import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Organization,
  User,
  ContactField,
  EmailConfig,
  InvoiceConfig,
  QuotationConfig,
  DealsConfig,
  IntegrationsConfig,
} from "../types/settings";

interface SettingsState {
  organization: Organization;
  users: User[];
  contactFields: ContactField[];
  emailConfig: EmailConfig;
  invoiceConfig: InvoiceConfig;
  quotationConfig: QuotationConfig;
  dealsConfig: DealsConfig;
  integrationsConfig: IntegrationsConfig;
  isLoaded: boolean;
  setOrganization: (org: Organization) => void;
  updateOrganization: (org: Partial<Organization>) => void;
  updateEmailConfig: (config: Partial<EmailConfig>) => void;
  updateInvoiceConfig: (config: Partial<InvoiceConfig>) => void;
  updateQuotationConfig: (config: Partial<QuotationConfig>) => void;
  updateDealsConfig: (config: Partial<DealsConfig>) => void;
  updateIntegrationsConfig: (config: Partial<IntegrationsConfig>) => void;
  addContactField: (field: Omit<ContactField, "id">) => void;
  updateContactField: (id: string, field: Partial<ContactField>) => void;
  deleteContactField: (id: string) => void;
  loadSettings: (orgId: string) => Promise<void>;
  resetSettings: () => void;
}

const defaultOrganization: Organization = {
  name: "",
  email: "",
  phone: "",
  address: "",
  timezone: "UTC",
  currency: "USD",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      organization: defaultOrganization,
      users: [],
      contactFields: [],
      emailConfig: {
        host: "",
        port: 587,
        username: "",
        password: "",
        encryption: "tls",
        fromName: "",
        fromEmail: "",
      },
      invoiceConfig: {
        resolutionDate: "",
        resolutionNumber: "",
        prefix: "",
        technicalKey: "",
        from: 0,
        to: 0,
        dateFrom: "",
        dateTo: "",
        generatedToDate: 0,
      },
      quotationConfig: {
        quotationNumber: "QT-{YEAR}-{NUMBER}",
        paymentTerms: "",
        shippingTerms: "",
        notes: "",
        bgImage: "",
        footerText: "",
      },
      dealsConfig: {
        pipelines: [],
        columns: [],
        customFields: [],
      },
      integrationsConfig: {
        providers: [],
      },
      isLoaded: false,

      setOrganization: (org) => set({ organization: org }),

      updateOrganization: (org) =>
        set((state) => ({
          organization: { ...state.organization, ...org },
        })),

      updateEmailConfig: (config) =>
        set((state) => ({
          emailConfig: { ...state.emailConfig, ...config },
        })),

      updateInvoiceConfig: (config) =>
        set((state) => ({
          invoiceConfig: { ...state.invoiceConfig, ...config },
        })),

      updateQuotationConfig: (config) =>
        set((state) => ({
          quotationConfig: { ...state.quotationConfig, ...config },
        })),

      updateDealsConfig: (config) =>
        set((state) => ({
          dealsConfig: { ...state.dealsConfig, ...config },
        })),

      updateIntegrationsConfig: (config) =>
        set((state) => ({
          integrationsConfig: { ...state.integrationsConfig, ...config },
        })),

      addContactField: (field) =>
        set((state) => ({
          contactFields: [
            ...state.contactFields,
            { ...field, id: `field_${Date.now()}` },
          ],
        })),

      updateContactField: (id, field) =>
        set((state) => ({
          contactFields: state.contactFields.map((f) =>
            f.id === id ? { ...f, ...field } : f
          ),
        })),

      deleteContactField: (id) =>
        set((state) => ({
          contactFields: state.contactFields.filter((f) => f.id !== id),
        })),

      loadSettings: async (orgId: string) => {
        try {
          const response = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/organizations/${orgId}/settings`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to load organization settings");
          }

          const data = await response.json();

          set({
            organization: data.organization,
            users: data.users,
            contactFields: data.contactFields,
            emailConfig: data.emailConfig,
            invoiceConfig: data.invoiceConfig,
            quotationConfig: data.quotationConfig,
            dealsConfig: data.dealsConfig,
            integrationsConfig: data.integrationsConfig,
            isLoaded: true,
          });
        } catch (error) {
          console.error("Error loading settings:", error);
          set({ isLoaded: true });
        }
      },

      resetSettings: () =>
        set({
          organization: defaultOrganization,
          users: [],
          contactFields: [],
          emailConfig: {
            host: "",
            port: 587,
            username: "",
            password: "",
            encryption: "tls",
            fromName: "",
            fromEmail: "",
          },
          invoiceConfig: {
            resolutionDate: "",
            resolutionNumber: "",
            prefix: "",
            technicalKey: "",
            from: 0,
            to: 0,
            dateFrom: "",
            dateTo: "",
            generatedToDate: 0,
          },
          quotationConfig: {
            quotationNumber: "QT-{YEAR}-{NUMBER}",
            paymentTerms: "",
            shippingTerms: "",
            notes: "",
            bgImage: "",
            footerText: "",
          },
          dealsConfig: {
            pipelines: [],
            columns: [],
            customFields: [],
          },
          integrationsConfig: {
            providers: [],
          },
          isLoaded: false,
        }),
    }),
    {
      name: "settings-storage",
    }
  )
);