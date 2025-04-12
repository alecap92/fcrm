import {
  IInvoiceConfig,
  ICompanyInfo,
  IEmail,
  IPlaceholders,
  IResolutionNumber,
  ISoftware,
} from "../types/invoiceConfig";
import { apiService } from "../config/apiConfig";

// Obtener toda la configuración de facturación
export const getInvoiceConfig = async (): Promise<any> => {
  try {
    const response = await apiService.get(`/invoiceConfig`);
    return response.data; // Retornamos response.data en lugar de response
  } catch (error) {
    console.error("Error fetching invoice config:", error);
    throw error; // Lanzamos el error directamente para manejarlo en el store
  }
};

// Actualizar toda la configuración de facturación
export const updateInvoice = async (config: IInvoiceConfig): Promise<any> => {
  try {
    const response: any = await apiService.put(`/invoiceConfig`, config);
    return response.data; // Retornamos response.data en lugar de response
  } catch (error) {
    console.error("Error updating invoice config:", error);
    throw error; // Lanzamos el error directamente
  }
};

// Actualizar solo la información de la empresa
export const updateCompanyInfo = async (
  companyInfo: ICompanyInfo
): Promise<any> => {
  try {
    const response: any = await apiService.put(
      `/invoiceConfig/company-info`,
      companyInfo
    );
    return response.data; // Retornamos response.data en lugar de response
  } catch (error) {
    console.error("Error updating company info:", error);
    throw error; // Lanzamos el error directamente
  }
};

// Actualizar solo la configuración de email
export const updateEmailSettings = async (
  emailSettings: IEmail
): Promise<any> => {
  try {
    const response: any = await apiService.put(
      `/invoiceConfig/email-settings`,
      emailSettings
    );
    return response.data; // Retornamos response.data en lugar de response
  } catch (error) {
    console.error("Error updating email settings:", error);
    throw error; // Lanzamos el error directamente
  }
};

// Actualizar solo los placeholders
export const updatePlaceholders = async (
  placeholders: IPlaceholders
): Promise<any> => {
  try {
    const response: any = await apiService.put(
      `/invoiceConfig/placeholders`,
      placeholders
    );
    return response.data; // Retornamos response.data en lugar de response
  } catch (error) {
    console.error("Error updating placeholders:", error);
    throw error; // Lanzamos el error directamente
  }
};

// Actualizar solo la información de resolución
export const updateResolutionNumber = async (
  resolutionNumber: IResolutionNumber
): Promise<any> => {
  try {
    const response: any = await apiService.put(
      `/invoiceConfig/resolution-number`,
      resolutionNumber
    );
    return response.data; // Retornamos response.data en lugar de response
  } catch (error) {
    console.error("Error updating resolution number:", error);
    throw error; // Lanzamos el error directamente
  }
};

// Actualizar configuración del software
export const updateSoftware = async (software: ISoftware): Promise<any> => {
  try {
    const response: any = await apiService.put(`/invoiceConfig/software`, software);
    return response.data;
  } catch (error) {
    console.error("Error updating software config:", error);
    throw error;
  }
};

// Método adicional: Generar número de factura siguiente
export const getNextInvoiceNumber = async (): Promise<any> => {
  try {
    const response: any = await apiService.get(`/invoiceConfig/next-number`);
    return response.data; // Retornamos response.data en lugar de response
  } catch (error) {
    console.error("Error getting next invoice number:", error);
    throw error; // Lanzamos el error directamente
  }
};

// Método adicional: Verificar estado de la resolución (vigencia, etc.)
export const checkResolutionStatus = async (): Promise<any> => {
  try {
    const response: any = await apiService.get(
      `/invoiceConfig/resolution-status`
    );
    return response.data; // Retornamos response.data en lugar de response
  } catch (error) {
    console.error("Error checking resolution status:", error);
    throw error; // Lanzamos el error directamente
  }
};

// Método adicional: Crear configuración de factura
export const createInvoiceConfig = async (
  config: IInvoiceConfig
): Promise<any> => {
  try {
    const response: any = await apiService.post(`/invoiceConfig`, config);
    return response.data; // Retornamos response.data en lugar de response
  } catch (error) {
    console.error("Error creating invoice config:", error);
    throw error; // Lanzamos el error directamente
  }
};

export const createCompany = async (companyInfo: any) => {
  try {
    const response: any = await apiService.post(`/invoiceConfig/company`, companyInfo);
    return response.data; // Retornamos response.data en lugar de response
  } catch (error) {
    console.error("Error creating company info:", error);
    throw error; // Lanzamos el error directamente
  }
}

// También podemos exportar un objeto con todas las funciones para mantener el namespace
export const invoiceConfigService = {
  getInvoiceConfig,
  updateInvoice,
  updateCompanyInfo,
  updateEmailSettings,
  updatePlaceholders,
  updateResolutionNumber,
  updateSoftware,
  getNextInvoiceNumber,
  checkResolutionStatus,
  createInvoiceConfig,
  createCompany
};
