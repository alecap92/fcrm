import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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

interface DealsContextType {
  // Estado
  deals: Deal[];
  columns: any[];
  activeDeal: Deal | null;
  selectedDeal: Deal | null;
  editingDeal: Deal | null;
  showCreateDealModal: boolean;
  pipelineId: string;

  // Setters
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  setColumns: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveDeal: React.Dispatch<React.SetStateAction<Deal | null>>;
  setSelectedDeal: React.Dispatch<React.SetStateAction<Deal | null>>;
  setEditingDeal: React.Dispatch<React.SetStateAction<Deal | null>>;
  setShowCreateDealModal: React.Dispatch<React.SetStateAction<boolean>>;

  // Acciones
  fetchDeals: () => Promise<void>;
  createDeal: (dealData: DealFormData) => Promise<void>;
  updateDeal: (dealData: DealFormData) => Promise<void>;
  deleteDeal: (dealId: string) => Promise<void>;
  updateDealStatus: (
    dealId: string,
    statusId: string,
    statusName: string
  ) => Promise<void>;

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
  // Estado
  const [deals, setDeals] = useState<Deal[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);

  // Pipeline ID - esto podría venir de props o de otro contexto
  const pipelineId = "66c6370ad573dacc51e620f0";

  const toast = useToast();
  const { showLoading, hideLoading } = useLoading();

  // Función para obtener deals
  const fetchDeals = async () => {
    try {
      showLoading("Cargando negocios...");
      const response = await dealsService.getDeals(pipelineId);
      const statuses = await dealsService.getStatuses(pipelineId);

      // Verificar que statuses.data existe y es un array
      const statusesData = statuses?.data || [];
      if (!Array.isArray(statusesData)) {
        console.error("statuses.data is not an array:", statusesData);
        setColumns([]);
        setDeals(response?.data || []);
        return;
      }

      // Ordenamos las columnas por la propiedad 'order'
      const orderedStatuses = [...statusesData].sort(
        (a, b) => a.order - b.order
      );

      setColumns(orderedStatuses);
      setDeals(response?.data || []);
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast.show({
        title: "Error",
        description: "No se pudieron cargar los negocios",
        type: "error",
      });
      // Establecer valores por defecto en caso de error
      setColumns([]);
      setDeals([]);
    } finally {
      hideLoading();
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

      const response = await dealsService.createDeal(form as any);

      // En lugar de intentar agregar el deal incompleto al estado,
      // refrescamos toda la lista para obtener los deals con todas las relaciones pobladas
      await fetchDeals();

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
      await fetchDeals();

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

  // Cargar deals al montar el componente
  useEffect(() => {
    fetchDeals();
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

    // Setters
    setDeals,
    setColumns,
    setActiveDeal,
    setSelectedDeal,
    setEditingDeal,
    setShowCreateDealModal,

    // Acciones
    fetchDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    updateDealStatus,

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
