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
import { useAuth } from "../contexts/AuthContext";

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
  addContactField: (field: Omit<ContactField, "_id">) => void;
  updateContactField: (id: string, field: Partial<ContactField>) => void;
  deleteContactField: (id: string) => void;
  loadSettings: (orgId: string) => Promise<void>;
  resetSettings: () => void;
}

const defaultOrganization: Organization = {
  address: {
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  },
  companyName: "",
  contactProperties: [],
  email: "",
  idNumber: "",
  idType: "",
  logoUrl: "",
  iconUrl: "",
  phone: "",
  settings: {
    formuapp: {},
    googleMaps: {},
    masiveEmails: {},
    purchases: {},
    quotations: {
      quotationNumber: "QT-{YEAR}-{NUMBER}",
      paymentTerms: [""],
      shippingTerms: [""],
      notes: "",
      bgImage: "",
      footerText: "",
    },
    whatsapp: {},
    invoiceSettings: {
      type_document_id: 0,
      prefix: "",
      resolution: 0,
      resolution_date: "",
      technical_key: "",
      from: 0,
      to: 0,
      generated_to_date: 0,
      date_from: "",
      date_to: "",
    },
  },
  whatsapp: "",
  createdAt: "",
  updatedAt: "",
  employees: [],
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
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
        type_document_id: 0,
        prefix: "",
        resolution: 0,
        resolution_date: "",
        technical_key: "",
        from: 0,
        to: 0,
        generated_to_date: 0,
        date_from: "",
        date_to: "",
      },
      quotationConfig: {
        quotationNumber: "QT-{YEAR}-{NUMBER}",
        paymentTerms: [""],
        shippingTerms: [""],
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
            { ...field, _id: `field_${Date.now()}` },
          ],
        })),

      updateContactField: (id, field) =>
        set((state) => ({
          contactFields: state.contactFields.map((f) =>
            f._id === id ? { ...f, ...field } : f
          ),
        })),

      deleteContactField: (id) =>
        set((state) => ({
          contactFields: state.contactFields.filter((f) => f._id !== id),
        })),

      loadSettings: async () => {
        try {
          const { organization } = useAuth();
          console.log(organization);
          set({
            organization: organization,
            users: organization.employees,
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
            type_document_id: 0,
            prefix: "",
            resolution: 0,
            resolution_date: "",
            technical_key: "",
            from: 0,
            to: 0,
            generated_to_date: 0,
            date_from: "",
            date_to: "",
          },
          quotationConfig: {
            quotationNumber: "QT-{YEAR}-{NUMBER}",
            paymentTerms: [""],
            shippingTerms: [""],
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
