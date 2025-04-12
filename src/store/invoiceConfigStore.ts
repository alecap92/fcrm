import { create } from "zustand";
import {
  IInvoiceConfig,
  ICompanyInfo,
  IEmail,
  IPlaceholders,
  IResolutionNumber,
  ISoftware,
} from "../types/invoiceConfig";
import { invoiceConfigService } from "../services/invoiceConfigService";

interface InvoiceConfigStore {
  // Estado
  invoiceConfig: IInvoiceConfig;
  isLoading: boolean;
  error: string | null;

  // Funciones básicas para manipular el estado
  setInvoiceConfig: (config: IInvoiceConfig) => void;
  updateInvoiceConfig: (field: keyof IInvoiceConfig, value: any) => void;
  setCompanyInfo: (info: ICompanyInfo) => void;
  updateCompanyInfo: (field: keyof ICompanyInfo, value: string) => void;
  setEmailSettings: (settings: IEmail) => void;
  updateEmailSettings: (
    field: keyof IEmail,
    value: string | number | boolean
  ) => void;
  setPlaceholders: (placeholders: IPlaceholders) => void;
  updatePlaceholders: (field: keyof IPlaceholders, value: string) => void;
  setResolutionNumber: (resolutionNumber: IResolutionNumber) => void;
  updateResolutionNumber: (
    field: keyof IResolutionNumber,
    value: string
  ) => void;
  setSoftware: (software: ISoftware) => void;
  updateSoftware: (field: keyof ISoftware, value: string) => void;

  // Funciones para interactuar con la API
  loadInvoiceConfig: () => Promise<void>;
  saveInvoiceConfig: () => Promise<boolean>;
  saveCompanyInfo: () => Promise<boolean>;
  saveEmailSettings: () => Promise<boolean>;
  savePlaceholders: () => Promise<boolean>;
  saveResolutionNumber: () => Promise<boolean>;
  saveSoftware: () => Promise<boolean>;
  clearError: () => void;
  configExists: boolean;
  createInvoiceConfig: () => Promise<boolean>;
  checkConfigExists: () => Promise<boolean>;
}

const useInvoiceConfigStore = create<InvoiceConfigStore>((set, get) => ({
  // Estado inicial
  invoiceConfig: {
    nextInvoiceNumber: "",
    resolutionNumber: {
      type_document_id: "",
      prefix: "",
      resolution: "",
      resolution_date: "",
      from: "",
      to: "",
      date_from: "",
      date_to: "",
      technical_key: ""
    },
    placeholders: {
      paymentTerms: "",
      currency: "",
      notes: "",
      logoImg: "",
      foot_note: "",
      head_note: "",
    },
    email: {
      mail_username: "",
      mail_password: "",
      mail_host: "",
      mail_port: 587,
      mail_encryption: "tls",
    },
    companyInfo: {
      email: "",
      address: "",
      phone: "",
      municipality_id: "",
      type_document_identification_id: "",
      type_organization_id: "",
      type_regime_id: "",
      type_liability_id: "",
      business_name: "",
      nit: "",
      dv: "",
    },
    software: {
      id: "",
      pin: "",
    },
    certificado: {
      certificate: null,
      password: "",
    },
    status: false,
  },
  isLoading: false,
  error: null,
  configExists: false,
  checkConfigExists: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await invoiceConfigService.getInvoiceConfig();
      const exists = !!response && Object.keys(response).length > 0;
      set({ configExists: exists, isLoading: false });

      if (exists) {
        set({ invoiceConfig: response });
      }

      return exists;
    } catch (error: any) {
      // Si recibimos un 404, significa que no existe la configuración
      // Esto NO es un error, es un estado válido que debemos manejar
      if (error.response && error.response.status === 404) {
        set({ configExists: false, isLoading: false, error: null });
        return false;
      }

      // Cualquier otro error diferente a 404 sí es un problema real
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error al verificar la configuración",
        isLoading: false,
        configExists: false, // También marcamos como no existente en caso de error
      });
      return false;
    }
  },
  // Crear nueva configuración
  createInvoiceConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      // Generamos un ID aleatorio para el documento (requerido por el backend)
      const defaultConfig = get().invoiceConfig;

      // Asegurarnos de tener un token por defecto
      const configToCreate = {
        ...defaultConfig,
        _id: `inv_${Date.now()}`, // Generamos un ID único
        token: "token_placeholder", // Campo requerido por el backend
      };

      const response = await invoiceConfigService.createInvoiceConfig(
        configToCreate
      );

      if (response) {
        set({
          invoiceConfig: response,
          configExists: true,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error: any) {
      // Capturar mensaje de error específico si está disponible
      let errorMessage = "Error al crear la configuración";

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Si es un error de validación de Mongoose, puede tener mensajes más detallados
      if (error.response && error.response.data && error.response.data.errors) {
        const validationErrors = Object.values(error.response.data.errors)
          .map((err: any) => err.message || err.toString())
          .join(", ");

        errorMessage = `Errores de validación: ${validationErrors}`;
      }

      set({
        error: errorMessage,
        isLoading: false,
      });
      return false;
    }
  },

  // Funciones de actualización del estado
  setInvoiceConfig: (config: IInvoiceConfig) => set({ invoiceConfig: config }),

  updateInvoiceConfig: (field: keyof IInvoiceConfig, value: any) =>
    set((state) => ({
      invoiceConfig: {
        ...state.invoiceConfig,
        [field]: value,
      },
    })),

  setCompanyInfo: (info: ICompanyInfo) =>
    set((state) => ({
      invoiceConfig: {
        ...state.invoiceConfig,
        companyInfo: info,
      },
    })),

  updateCompanyInfo: (field: keyof ICompanyInfo, value: string) =>
    set((state) => {
      const updatedCompanyInfo = {
        ...state.invoiceConfig.companyInfo,
        [field]: value,
      };
      return {
        invoiceConfig: {
          ...state.invoiceConfig,
          companyInfo: updatedCompanyInfo,
        },
      };
    }),

  setEmailSettings: (settings: IEmail) =>
    set((state) => ({
      invoiceConfig: {
        ...state.invoiceConfig,
        email: settings,
      },
    })),

  updateEmailSettings: (
    field: keyof IEmail,
    value: string | number | boolean
  ) =>
    set((state) => {
      const updatedEmailSettings = {
        ...state.invoiceConfig.email,
        [field]: value,
      };
      return {
        invoiceConfig: {
          ...state.invoiceConfig,
          email: updatedEmailSettings,
        },
      };
    }),

  setPlaceholders: (placeholders: IPlaceholders) =>
    set((state) => ({
      invoiceConfig: {
        ...state.invoiceConfig,
        placeholders,
      },
    })),

  updatePlaceholders: (field: keyof IPlaceholders, value: string) =>
    set((state) => {
      const updatedPlaceholders = {
        ...state.invoiceConfig.placeholders,
        [field]: value,
      };
      return {
        invoiceConfig: {
          ...state.invoiceConfig,
          placeholders: updatedPlaceholders,
        },
      };
    }),

  setResolutionNumber: (resolutionNumber: IResolutionNumber) =>
    set((state) => ({
      invoiceConfig: {
        ...state.invoiceConfig,
        resolutionNumber,
      },
    })),

  updateResolutionNumber: (field: keyof IResolutionNumber, value: string) =>
    set((state) => {
      const updatedResolutionNumber = {
        ...state.invoiceConfig.resolutionNumber,
        [field]: value,
      };
      return {
        invoiceConfig: {
          ...state.invoiceConfig,
          resolutionNumber: updatedResolutionNumber,
        },
      };
    }),

  setSoftware: (software: ISoftware) =>
    set((state) => ({
      invoiceConfig: {
        ...state.invoiceConfig,
        software,
      },
    })),

  updateSoftware: (field: keyof ISoftware, value: string) =>
    set((state) => {
      const updatedSoftware = {
        ...state.invoiceConfig.software,
        [field]: value,
      };
      return {
        invoiceConfig: {
          ...state.invoiceConfig,
          software: updatedSoftware,
        },
      };
    }),

  // Funciones para interactuar con la API
  clearError: () => set({ error: null }),

  loadInvoiceConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const config = await invoiceConfigService.getInvoiceConfig();
      set({ invoiceConfig: config, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al cargar configuración",
        isLoading: false,
      });
    }
  },

  saveInvoiceConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const currentConfig = get().invoiceConfig;
      await invoiceConfigService.updateInvoice(currentConfig);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al guardar configuración",
        isLoading: false,
      });
      return false;
    }
  },

  saveCompanyInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const companyInfo = get().invoiceConfig.companyInfo;
      await invoiceConfigService.updateCompanyInfo(companyInfo);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error al guardar información de la empresa",
        isLoading: false,
      });
      return false;
    }
  },

  saveEmailSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const emailSettings = get().invoiceConfig.email;
      await invoiceConfigService.updateEmailSettings(emailSettings);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error al guardar configuración de email",
        isLoading: false,
      });
      return false;
    }
  },

  savePlaceholders: async () => {
    set({ isLoading: true, error: null });
    try {
      const placeholders = get().invoiceConfig.placeholders;
      await invoiceConfigService.updatePlaceholders(placeholders);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error al guardar placeholders",
        isLoading: false,
      });
      return false;
    }
  },

  saveResolutionNumber: async () => {
    set({ isLoading: true, error: null });
    try {
      const resolutionNumber = get().invoiceConfig.resolutionNumber;
      await invoiceConfigService.updateResolutionNumber(resolutionNumber);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error al guardar información de resolución",
        isLoading: false,
      });
      return false;
    }
  },

  saveSoftware: async () => {
    set({ isLoading: true, error: null });
    try {
      const software = get().invoiceConfig.software;
      await invoiceConfigService.updateSoftware(software);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error al guardar configuración del software",
        isLoading: false,
      });
      return false;
    }
  },
}));

export default useInvoiceConfigStore;

