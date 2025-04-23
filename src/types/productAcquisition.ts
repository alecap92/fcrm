// types/productAcquisition.ts

// Enumeración para los estados posibles de una adquisición
export enum AcquisitionStatus {
    ACTIVE = "active",
    CANCELLED = "cancelled",
    RETURNED = "returned",
    PENDING = "pending",
    COMPLETED = "completed"
  }
  
  // Interfaz principal para una adquisición de producto
  export interface ProductAcquisition {
    id: string;
    organizationId: string;
    clientId: string;
    productId: string;
    variantId?: string;
    dealId?: string;
    quotationId?: string;
    invoiceId?: string;
    quantity: number;
    priceAtAcquisition: number;
    acquisitionDate: string;
    status: AcquisitionStatus;
    notes?: string;
    tags?: string[];
    userId: string;
    createdAt: string;
    updatedAt: string;
    
    // Datos relacionados que pueden venir populados del backend
    client?: {
      id: string;
      name: string;
      email?: string;
    };
    product?: {
      id: string;
      name: string;
      sku: string;
      imageUrl?: string;
    };
    variant?: {
      id: string;
      name: string;
      sku: string;
      attributes?: Record<string, string>;
    };
  }
  
  // Interfaz para la creación de una adquisición
  export interface CreateAcquisitionDto {
    clientId: string;
    productId: string;
    variantId?: string;
    dealId?: string;
    quotationId?: string;
    invoiceId?: string;
    quantity: number;
    priceAtAcquisition: number;
    acquisitionDate: string;
    status?: AcquisitionStatus;
    notes?: string;
    tags?: string[];
  }
  
  // Interfaz para la actualización de una adquisición
  export interface UpdateAcquisitionDto {
    clientId?: string;
    productId?: string;
    variantId?: string;
    dealId?: string;
    quotationId?: string;
    invoiceId?: string;
    quantity?: number;
    priceAtAcquisition?: number;
    acquisitionDate?: string;
    status?: AcquisitionStatus;
    notes?: string;
    tags?: string[];
  }
  
  // Interfaz para los filtros de búsqueda
  export interface AcquisitionFilters {
    startDate?: string;
    endDate?: string;
    status?: AcquisitionStatus;
    clientId?: string;
    productId?: string;
    search?: string;
  }
  
  // Interfaz para la respuesta paginada
  export interface PaginatedAcquisitionResponse {
    acquisitions: ProductAcquisition[];
    totalPages: number;
    currentPage: number;
    totalAcquisitions: number;
  }
  
  // Interfaces para las estadísticas
  export interface AcquisitionStats {
    topProducts: TopProductStat[];
    temporalTrends: TemporalTrendStat[];
    variantBreakdown: VariantBreakdownStat[];
  }
  
  export interface TopProductStat {
    _id: string;
    totalQuantity: number;
    totalRevenue: number;
    product?: {
      name: string;
      sku: string;
      imageUrl?: string;
    };
  }
  
  export interface TemporalTrendStat {
    _id: {
      year: number;
      month: number;
    };
    totalQuantity: number;
    totalRevenue: number;
    formattedDate?: string; // Para facilitar visualización en gráficos
  }
  
  export interface VariantBreakdownStat {
    _id: string;
    totalQuantity: number;
    variant?: {
      name: string;
      sku: string;
      attributes?: Record<string, string>;
    };
  }
  
  // Interfaz para el estado de adquisiciones en un componente React
  export interface AcquisitionState {
    acquisitions: ProductAcquisition[];
    isLoading: boolean;
    error: string | null;
    selectedAcquisition: ProductAcquisition | null;
    filters: AcquisitionFilters;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
    stats: AcquisitionStats | null;
  }
  
  // Interfaz para Props de componentes comunes
  export interface AcquisitionListProps {
    acquisitions: ProductAcquisition[];
    isLoading: boolean;
    onSelect?: (acquisition: ProductAcquisition) => void;
    onDelete?: (id: string) => void;
    onStatusChange?: (id: string, status: AcquisitionStatus) => void;
  }
  
  export interface AcquisitionFormProps {
    initialData?: Partial<CreateAcquisitionDto>;
    onSubmit: (data: CreateAcquisitionDto | UpdateAcquisitionDto) => void;
    isLoading?: boolean;
    isEdit?: boolean;
  }
  
  export interface AcquisitionFilterProps {
    filters: AcquisitionFilters;
    onFilterChange: (filters: AcquisitionFilters) => void;
  }
  
  export interface AcquisitionStatsProps {
    stats: AcquisitionStats;
    isLoading: boolean;
    dateRange?: {
      startDate: string;
      endDate: string;
    };
  }