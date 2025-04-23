import { apiService } from "../config/apiConfig";
import type { ProductAcquisition } from "../types/productAcquisition";



interface AcquisitionStats {
  topProducts: {
    _id: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  temporalTrends: {
    _id: {
      year: number;
      month: number;
    };
    totalQuantity: number;
    totalRevenue: number;
  }[];
  variantBreakdown: {
    _id: string;
    totalQuantity: number;
  }[];
}

// Crear una nueva adquisición de producto
const createAcquisition = async (acquisition: Omit<ProductAcquisition, "id" | "createdAt" | "updatedAt">) => {
  try {
    const response = await apiService.post<ProductAcquisition>("/acquisitions", acquisition);
    return response;
  } catch (error) {
    console.error('Error creating product acquisition:', error);
    throw error;
  }
};

// Obtener adquisiciones por cliente
const getClientAcquisitions = async (
  clientId: string, 
  startDate?: string, 
  endDate?: string, 
  status?: string
) => {
  try {
    let url = `/acquisitions/client/${clientId}`;
    
    // Construir parámetros de consulta
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    const response = await apiService.get<ProductAcquisition[]>(url);
    return response;
  } catch (error) {
    console.error(`Error fetching acquisitions for client ${clientId}:`, error);
    throw error;
  }
};

// Obtener estadísticas de adquisiciones
const getAcquisitionStats = async (startDate?: string, endDate?: string) => {
  try {
    let url = '/acquisitions/stats';
    
    // Construir parámetros de consulta
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    const response = await apiService.get<AcquisitionStats>(url);
    return response;
  } catch (error) {
    console.error('Error fetching acquisition statistics:', error);
    throw error;
  }
};

// Actualizar una adquisición existente
const updateAcquisition = async (id: string, acquisition: Partial<ProductAcquisition>) => {
  try {
    const response = await apiService.put<ProductAcquisition>(`/acquisitions/${id}`, acquisition);
    return response;
  } catch (error) {
    console.error(`Error updating acquisition ${id}:`, error);
    throw error;
  }
};

// Eliminar una adquisición
const deleteAcquisition = async (id: string) => {
  try {
    await apiService.delete(`/acquisitions/${id}`);
  } catch (error) {
    console.error(`Error deleting acquisition ${id}:`, error);
    throw error;
  }
};

// Obtener adquisiciones por producto
const getProductAcquisitions = async (
  productId: string,
  startDate?: string,
  endDate?: string,
  status?: string
) => {
  try {
    let url = `/acquisitions/product/${productId}`;
    
    // Construir parámetros de consulta
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    const response = await apiService.get<ProductAcquisition[]>(url);
    return response;
  } catch (error) {
    console.error(`Error fetching acquisitions for product ${productId}:`, error);
    throw error;
  }
};

// Obtener una adquisición específica por ID
const getAcquisitionById = async (id: string) => {
  try {
    const response = await apiService.get<ProductAcquisition>(`/acquisitions/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching acquisition ${id}:`, error);
    throw error;
  }
};

// Cambiar el estado de una adquisición
const updateAcquisitionStatus = async (id: string, status: string) => {
  try {
    const response = await apiService.put<ProductAcquisition>(`/acquisitions/${id}/status`, { status });
    return response;
  } catch (error) {
    console.error(`Error updating status for acquisition ${id}:`, error);
    throw error;
  }
};

const productAcquisitionService = {
  createAcquisition,
  getClientAcquisitions,
  getAcquisitionStats,
  updateAcquisition,
  deleteAcquisition,
  getProductAcquisitions,
  getAcquisitionById,
  updateAcquisitionStatus
};

export default productAcquisitionService;