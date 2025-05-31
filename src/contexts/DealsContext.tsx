import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { dealsService } from "../services/dealsService";
import { useToast } from "../components/ui/toast";
import { useLoading } from "./LoadingContext";
import type { Deal } from "../types/deal";

interface DealFormData {
  name: string;
  value: number;
  expectedCloseDate: string;
  contact: { id: string };
  stage: string;
  fields: Array<{ field: any; value: string }>;
  products: Array<{ id: string; quantity: number }>;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  isLoadingMore: boolean;
}

interface DealsContextType {
  // Estado
  deals: Deal[];
  columns: any[];
  activeDeal: Deal | null;
  selectedDeal: Deal | null;
  editingDeal: Deal | null;
  showCreateDealModal: boolean;
  pipelineId: string;
  currentDeal: Deal | null;
  relatedDeals: Deal[];
  pagination: PaginationState;
  searchResults: Deal[];

  // Setters
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  setColumns: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveDeal: React.Dispatch<React.SetStateAction<Deal | null>>;
  setSelectedDeal: React.Dispatch<React.SetStateAction<Deal | null>>;
  setEditingDeal: React.Dispatch<React.SetStateAction<Deal | null>>;
  setShowCreateDealModal: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentDeal: React.Dispatch<React.SetStateAction<Deal | null>>;
  setRelatedDeals: React.Dispatch<React.SetStateAction<Deal[]>>;

  // Acciones
  fetchDeals: (reset?: boolean) => Promise<void>;
  loadMoreDeals: () => Promise<void>;
  fetchDealById: (dealId: string) => Promise<Deal | null>;
  fetchRelatedDeals: (
    contactId: string,
    excludeDealId?: string
  ) => Promise<Deal[]>;
  createDeal: (dealData: DealFormData) => Promise<void>;
  updateDeal: (dealData: DealFormData) => Promise<void>;
  updateDealById: (dealId: string, dealData: any) => Promise<void>;
  deleteDeal: (dealId: string) => Promise<void>;
  updateDealStatus: (
    dealId: string,
    statusId: string,
    statusName: string
  ) => Promise<void>;
  searchDeals: (query: string) => Promise<void>;
  changePipeline: (newPipelineId: string) => Promise<void>;

  // Handlers para modales
  openCreateDealModal: () => void;
  closeCreateDealModal: () => void;
  openEditDealModal: (deal: Deal) => void;
  closeEditDealModal: () => void;
  openDealDetailsModal: (deal: Deal) => void;
  closeDealDetailsModal: () => void;
}

const DealsContext = createContext<DealsContextType | undefined>(undefined);

interface DealsProviderProps {
  children: ReactNode;
}

export function DealsProvider({ children }: DealsProviderProps) {
  // Configuración de paginación
  const DEALS_PER_PAGE = 50; // Cambia este número según tus necesidades

  // Estado
  const [deals, setDeals] = useState<Deal[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
  const [relatedDeals, setRelatedDeals] = useState<Deal[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: true,
    isLoadingMore: false,
  });
  const [searchResults, setSearchResults] = useState<Deal[]>([]);

  // Pipeline ID - ahora es dinámico
  const [pipelineId, setPipelineId] = useState("66c6370ad573dacc51e620f0");

  const toast = useToast();
  const { showLoading, hideLoading } = useLoading();

  // Función para obtener deals
  const fetchDeals = async (reset?: boolean) => {
    await fetchDealsForPipeline(pipelineId);
  };

  // Función para obtener un deal individual
  const fetchDealById = async (dealId: string): Promise<Deal | null> => {
    try {
      const response = await dealsService.getDealById(dealId);

      // Parsear la respuesta para unir deal y fields si es necesario
      if (response.data && response.data.deal) {
        const dealData = {
          ...response.data.deal,
          fields: response.data.fields || [],
        };
        return dealData;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching deal by ID:", error);
      toast.show({
        title: "Error",
        description: "Error al cargar los detalles del negocio",
        type: "error",
      });
      return null;
    }
  };

  // Función para obtener deals relacionados (usando contactsService)
  const fetchRelatedDeals = async (
    contactId: string,
    excludeDealId?: string
  ): Promise<Deal[]> => {
    try {
      // Importar contactsService aquí para evitar dependencias circulares
      const { contactsService } = await import("../services/contactsService");
      const contactResponse = await contactsService.getContactById(contactId);

      if (contactResponse.data.deals) {
        const filteredDeals = excludeDealId
          ? contactResponse.data.deals.filter(
              (deal: Deal) => deal._id !== excludeDealId
            )
          : contactResponse.data.deals;
        return filteredDeals;
      }
      return [];
    } catch (error) {
      console.error("Error fetching related deals:", error);
      return [];
    }
  };

  // Función para crear deal
  const createDeal = async (dealData: DealFormData) => {
    try {
      const form = {
        title: dealData.name,
        amount: Number(dealData.value),
        closingDate: dealData.expectedCloseDate,
        associatedContactId: dealData.contact.id,
        pipeline: pipelineId,
        status: dealData.stage,
        fields: dealData.fields,
        products: dealData.products,
      };

      await dealsService.createDeal(form as any);

      // En lugar de intentar agregar el deal incompleto al estado,
      // refrescamos toda la lista para obtener los deals con todas las relaciones pobladas
      await fetchDeals(true);

      toast.show({
        title: "Negocio creado",
        description: "El nuevo negocio se ha creado exitosamente",
        type: "success",
      });

      closeCreateDealModal();
    } catch (error) {
      console.error("Error creating deal:", error);
      toast.show({
        title: "Error",
        description: "No se pudo crear el negocio",
        type: "error",
      });
    }
  };

  // Función para actualizar deal
  const updateDeal = async (dealData: DealFormData) => {
    if (!editingDeal?._id) return;

    try {
      console.log("Productos a actualizar:", dealData.products);

      const form = {
        title: dealData.name,
        amount: Number(dealData.value),
        closingDate: dealData.expectedCloseDate,
        associatedContactId: dealData.contact.id,
        status: dealData.stage,
        fields: dealData.fields,
        dealProducts: dealData.products,
      };

      console.log("Enviando al backend:", form);

      await dealsService.updateDeal(editingDeal._id, form as any);

      // Refrescar la lista completa para obtener los deals actualizados con todas las relaciones pobladas
      await fetchDeals(true);

      toast.show({
        title: "Negocio actualizado",
        description: "El negocio se ha actualizado exitosamente",
        type: "success",
      });

      closeEditDealModal();
    } catch (error) {
      console.error("Error updating deal:", error);
      toast.show({
        title: "Error",
        description: "No se pudo actualizar el negocio",
        type: "error",
      });
    }
  };

  // Función para actualizar deal por ID
  const updateDealById = async (dealId: string, dealData: any) => {
    try {
      const updatedDeal = await dealsService.updateDeal(dealId, dealData);

      // Actualizar el currentDeal si es el mismo que se está editando
      if (currentDeal?._id === dealId) {
        const updatedDealDetails = await fetchDealById(dealId);
        setCurrentDeal(updatedDealDetails);
      }

      // Actualizar el deal en la lista local sin resetear la paginación
      setDeals((prev) =>
        prev.map((deal) =>
          deal._id === dealId ? { ...deal, ...updatedDeal } : deal
        )
      );

      toast.show({
        title: "Negocio actualizado",
        description: "El negocio se ha actualizado exitosamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating deal by ID:", error);
      toast.show({
        title: "Error",
        description: "No se pudo actualizar el negocio",
        type: "error",
      });
    }
  };

  // Función para eliminar deal
  const deleteDeal = async (dealId: string) => {
    try {
      await dealsService.deleteDeal(dealId);
      setDeals((prev) => prev.filter((deal) => deal._id !== dealId));
      toast.show({
        title: "Negocio eliminado",
        description: "El negocio se ha eliminado exitosamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting deal:", error);
      toast.show({
        title: "Error",
        description: "No se pudo eliminar el negocio",
        type: "error",
      });
    }
  };

  // Función para actualizar estado del deal
  const updateDealStatus = async (
    dealId: string,
    statusId: string,
    statusName: string
  ) => {
    try {
      const updated = await dealsService.updateDealStatus(dealId, {
        status: statusId,
      });

      if (!updated) throw new Error("No response");

      // Buscar el status completo en las columnas existentes
      const newStatus = columns.find((col) => col._id === statusId);
      if (!newStatus) throw new Error("Status not found");

      setDeals((current) =>
        current.map((deal) =>
          deal._id === dealId ? { ...deal, status: newStatus } : deal
        )
      );

      toast.show({
        title: "Estado actualizado",
        description: `El negocio se movió a "${statusName}"`,
        type: "success",
      });
    } catch {
      toast.show({
        title: "Error",
        description: "No se pudo actualizar el negocio",
        type: "error",
      });
    }
  };

  // Función para buscar deals
  const searchDeals = useCallback(
    async (query: string) => {
      try {
        const response = await dealsService.searchDeals(query);
        setSearchResults(response.data || []);
      } catch (error) {
        console.error("Error searching deals:", error);
        setSearchResults([]);
        toast.show({
          title: "Error",
          description: "No se pudieron buscar los negocios",
          type: "error",
        });
      }
    },
    [toast]
  );

  // Handlers para modales
  const openCreateDealModal = () => setShowCreateDealModal(true);
  const closeCreateDealModal = () => {
    setShowCreateDealModal(false);
    setEditingDeal(null);
    setSelectedDeal(null);
    setActiveDeal(null);
  };

  const openEditDealModal = (deal: Deal) => {
    setEditingDeal(deal);
    setSelectedDeal(null);
  };

  const closeEditDealModal = () => {
    setEditingDeal(null);
  };

  const openDealDetailsModal = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  const closeDealDetailsModal = () => {
    setSelectedDeal(null);
  };

  // Función para cargar más deals (scroll infinito)
  const loadMoreDeals = async () => {
    console.log("🔄 loadMoreDeals llamado");
    console.log("📊 Estado actual:", {
      isLoadingMore: pagination.isLoadingMore,
      hasNextPage: pagination.hasNextPage,
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      dealsCount: deals.length,
      pipelineId,
    });

    if (pagination.isLoadingMore || !pagination.hasNextPage) {
      console.log(
        "❌ Cancelando loadMoreDeals - ya cargando o no hay más páginas"
      );
      return;
    }

    setPagination((prev) => ({ ...prev, isLoadingMore: true }));

    try {
      const nextPage = pagination.currentPage + 1;
      console.log(
        `📥 Solicitando página ${nextPage} para pipeline ${pipelineId}`
      );

      const response = await dealsService.getDeals(pipelineId, {
        page: nextPage,
        limit: DEALS_PER_PAGE,
      });

      console.log("📦 Respuesta del servidor para loadMoreDeals:", {
        page: response?.page,
        totalPages: response?.totalPages,
        total: response?.total,
        limit: response?.limit,
        dataLength: response?.data?.length,
        hasNextPage:
          (response?.page || nextPage) <
          (response?.totalPages || pagination.totalPages),
        responseStructure: response ? Object.keys(response) : [],
      });

      // Verificar que la respuesta tiene la estructura esperada
      if (!response || !Array.isArray(response.data)) {
        console.error("❌ Respuesta inválida en loadMoreDeals:", response);
        setPagination((prev) => ({ ...prev, isLoadingMore: false }));
        return;
      }

      // Usar el callback de setDeals para acceder al estado más reciente
      setDeals((prevDeals) => {
        // Solo agregar deals que no existan ya en el estado actual
        const existingDealIds = new Set(prevDeals.map((deal) => deal._id));
        const newDeals = response.data.filter(
          (deal) => !existingDealIds.has(deal._id)
        );

        console.log("🔍 Análisis de duplicados:");
        console.log("  - Deals existentes:", prevDeals.length);
        console.log("  - Nuevos deals recibidos:", response.data.length);
        console.log("  - Nuevos deals únicos a agregar:", newDeals.length);
        console.log(
          "  - IDs existentes (primeros 5):",
          Array.from(existingDealIds).slice(0, 5)
        );
        console.log(
          "  - IDs nuevos recibidos:",
          response.data.map((d) => d._id).slice(0, 5)
        );

        const finalDeals = [...prevDeals, ...newDeals];
        console.log("✅ Total deals después de agregar:", finalDeals.length);

        return finalDeals;
      });

      setPagination({
        currentPage: response.page || nextPage,
        totalPages: response.totalPages || pagination.totalPages,
        hasNextPage:
          (response.page || nextPage) <
          (response.totalPages || pagination.totalPages),
        isLoadingMore: false,
      });

      console.log("✅ loadMoreDeals completado exitosamente");
    } catch (error) {
      console.error("❌ Error loading more deals:", {
        error,
        errorMessage:
          error instanceof Error ? error.message : "Error desconocido",
        errorCode: (error as any)?.code,
        errorStatus: (error as any)?.status,
        pipelineId,
        currentPage: pagination.currentPage,
        nextPage: pagination.currentPage + 1,
      });
      setPagination((prev) => ({ ...prev, isLoadingMore: false }));
    }
  };

  // Función para cambiar pipeline
  const changePipeline = async (newPipelineId: string) => {
    console.log("🔄 Cambiando pipeline de", pipelineId, "a", newPipelineId);

    if (newPipelineId === pipelineId) {
      console.log("❌ El pipeline seleccionado es el mismo, no se hace nada");
      return;
    }

    try {
      setPipelineId(newPipelineId);

      // Resetear estado
      setDeals([]);
      setColumns([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: true,
        isLoadingMore: false,
      });

      // Cargar deals del nuevo pipeline
      await fetchDealsForPipeline(newPipelineId);

      toast.show({
        title: "Pipeline cambiado",
        description: "Los negocios se han actualizado correctamente",
        type: "success",
      });
    } catch (error) {
      console.error("❌ Error cambiando pipeline:", error);
      toast.show({
        title: "Error",
        description: "No se pudo cambiar el pipeline",
        type: "error",
      });
      // Revertir el cambio en caso de error
      setPipelineId(pipelineId);
    }
  };

  // Función auxiliar para obtener deals de un pipeline específico
  const fetchDealsForPipeline = async (targetPipelineId: string) => {
    console.log(
      "🚀 fetchDealsForPipeline llamado para pipeline:",
      targetPipelineId
    );

    try {
      showLoading("Cargando negocios...");
      console.log(
        "📥 Solicitando página inicial (1) para pipeline:",
        targetPipelineId
      );

      // Hacer ambas llamadas en paralelo
      const [dealsResponse, statusesResponse] = await Promise.all([
        dealsService
          .getDeals(targetPipelineId, {
            page: 1,
            limit: DEALS_PER_PAGE,
          })
          .catch((error) => {
            console.error("Error cargando deals:", error);
            return {
              data: [],
              page: 1,
              totalPages: 1,
              total: 0,
              limit: DEALS_PER_PAGE,
            }; // Valor por defecto si falla
          }),
        dealsService.getStatuses(targetPipelineId).catch((error) => {
          console.error("Error cargando statuses:", error);
          return { data: [] }; // Valor por defecto si falla
        }),
      ]);

      console.log("📦 Respuesta del servidor para pipeline:", {
        pipelineId: targetPipelineId,
        page: dealsResponse?.page,
        totalPages: dealsResponse?.totalPages,
        total: dealsResponse?.total,
        limit: dealsResponse?.limit,
        dataLength: dealsResponse?.data?.length,
        statusesLength: statusesResponse?.data?.length,
        dealsResponseStructure: dealsResponse ? Object.keys(dealsResponse) : [],
        statusesResponseStructure: statusesResponse
          ? Object.keys(statusesResponse)
          : [],
      });

      // Verificar que statuses.data existe y es un array
      const statusesData = statusesResponse?.data || [];
      if (!Array.isArray(statusesData)) {
        console.error("statuses.data is not an array:", statusesData);
        setColumns([]);
      } else {
        // Ordenamos las columnas por la propiedad 'order'
        const orderedStatuses = [...statusesData].sort(
          (a, b) => a.order - b.order
        );
        setColumns(orderedStatuses);
        console.log("✅ Columnas cargadas:", orderedStatuses.length);
      }

      // Verificar que deals.data existe y es un array
      const dealsData = dealsResponse?.data || [];
      if (!Array.isArray(dealsData)) {
        console.error("deals.data is not an array:", dealsData);
        setDeals([]);
      } else {
        setDeals(dealsData);
        console.log("✅ Deals cargados para pipeline:", dealsData.length);
      }

      // Actualizar información de paginación con valores por defecto seguros
      const currentPage = dealsResponse?.page || 1;
      const totalPages = dealsResponse?.totalPages || 1;
      const hasNextPage = currentPage < totalPages;

      setPagination({
        currentPage,
        totalPages,
        hasNextPage,
        isLoadingMore: false,
      });

      console.log("📊 Paginación para nuevo pipeline:", {
        currentPage,
        totalPages,
        hasNextPage,
        total: dealsResponse?.total || 0,
      });
    } catch (error) {
      console.error("❌ Error fetching deals for pipeline:", error);

      // Intentar cargar al menos las columnas si todo falla
      try {
        console.log("🔄 Intentando cargar solo las columnas...");
        const statusesResponse = await dealsService.getStatuses(
          targetPipelineId
        );
        const statusesData = statusesResponse?.data || [];

        if (Array.isArray(statusesData)) {
          const orderedStatuses = [...statusesData].sort(
            (a, b) => a.order - b.order
          );
          setColumns(orderedStatuses);
          console.log(
            "✅ Columnas cargadas en fallback:",
            orderedStatuses.length
          );
        }
      } catch (statusError) {
        console.error("❌ Error cargando columnas en fallback:", statusError);
        setColumns([]);
      }

      toast.show({
        title: "Error",
        description: "No se pudieron cargar los negocios",
        type: "error",
      });

      // Establecer valores por defecto en caso de error
      setDeals([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        isLoadingMore: false,
      });
    } finally {
      hideLoading();
    }
  };

  // Cargar deals al montar el componente
  useEffect(() => {
    fetchDeals(true); // Reset = true para cargar desde la primera página
  }, [pipelineId]);

  const value: DealsContextType = {
    // Estado
    deals,
    columns,
    activeDeal,
    selectedDeal,
    editingDeal,
    showCreateDealModal,
    pipelineId,
    currentDeal,
    relatedDeals,
    pagination,
    searchResults,

    // Setters
    setDeals,
    setColumns,
    setActiveDeal,
    setSelectedDeal,
    setEditingDeal,
    setShowCreateDealModal,
    setCurrentDeal,
    setRelatedDeals,

    // Acciones
    fetchDeals,
    loadMoreDeals,
    fetchDealById,
    fetchRelatedDeals,
    createDeal,
    updateDeal,
    updateDealById,
    deleteDeal,
    updateDealStatus,
    searchDeals,
    changePipeline,

    // Handlers para modales
    openCreateDealModal,
    closeCreateDealModal,
    openEditDealModal,
    closeEditDealModal,
    openDealDetailsModal,
    closeDealDetailsModal,
  };

  return (
    <DealsContext.Provider value={value}>{children}</DealsContext.Provider>
  );
}

export function useDeals() {
  const context = useContext(DealsContext);
  if (context === undefined) {
    throw new Error("useDeals debe ser usado dentro de un DealsProvider");
  }
  return context;
}
