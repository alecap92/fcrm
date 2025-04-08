import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { DealFilters } from "../components/deals/DealFilters";
import { CreateDealModal } from "../components/deals/CreateDealModal";
import { DealDetailsModal } from "../components/deals/DealDetailsModal";
import { useToast } from "../components/ui/toast";
import { DealColumn } from "../components/deals/DealColumn";
import { DealCard } from "../components/deals/DealCard";
import { dealsService } from "../services/dealsService";

// Importamos los tipos que asumo tienes en tu proyecto
import type { Deal } from "../types/deal";

interface DealFormData {
  name: string;
  value: number;
  expectedCloseDate: string;
  contact: { id: string };
  stage: string;
  fields: Array<{ field: any; value: string }>;
}

export function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const toast = useToast();

  // Ejemplo de pipelineId
  const pipelineId = "66c6370ad573dacc51e620f0";

  // Creamos un sensor para manejar press delay en móviles
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 5,
    },
  });

  // Agrupamos nuestros sensores
  const sensors = useSensors(pointerSensor);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await dealsService.getDeals(pipelineId);
        const statuses = await dealsService.getStatuses(pipelineId);

        // Ordenamos las columnas por la propiedad 'order'
        const orderedStatuses = [...(statuses.data || [])].sort(
          (a, b) => a.order - b.order
        );

        setColumns(orderedStatuses);
        setDeals(response.data || []);
      } catch (error) {
        console.error("Error fetching deals:", error);
        toast.show({
          title: "Error",
          description: "No se pudieron cargar los negocios",
          type: "error",
        });
      }
    };

    fetchDeals();
  }, [pipelineId, toast]);

  const handleDragStart = (event: DragStartEvent) => {
    const draggedDeal = deals.find((deal) => deal._id === event.active.id);
    if (draggedDeal) setActiveDeal(draggedDeal);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over || over.id === active.id) return;

    const draggedDeal = deals.find((deal) => deal._id === active.id);
    const overDeal = deals.find((deal) => deal._id === over.id);

    if (!draggedDeal) return;

    // Si arrastramos sobre otra "columna"
    const targetColumn = columns.find((col) => col._id === over.id);

    if (targetColumn) {
      // Significa que se soltó directamente sobre la columna
      // Aquí puedes actualizar el estado del deal en el backend y en el estado local
      try {
        const updated = await dealsService.updateDealStatus(
          draggedDeal._id as string,
          {
            status: targetColumn._id,
          }
        );

        if (!updated) throw new Error("No response");

        setDeals((current) =>
          current.map((deal) =>
            deal._id === draggedDeal._id
              ? { ...deal, status: targetColumn }
              : deal
          )
        );

        toast.show({
          title: "Estado actualizado",
          description: `El negocio se movió a "${targetColumn.name}"`,
          type: "success",
        });
      } catch {
        toast.show({
          title: "Error",
          description: "No se pudo actualizar el negocio",
          type: "error",
        });
      }
    } else if (overDeal) {
      // Significa que se soltó sobre otro DealCard
      // Aquí puedes actualizar el estado del deal en el backend y en el estado local
      try {
        const updated = await dealsService.updateDealStatus(
          draggedDeal._id as string,
          {
            status: overDeal.status._id,
          }
        );

        if (!updated) throw new Error("No response");

        setDeals((current) =>
          current.map((deal) =>
            deal._id === draggedDeal._id
              ? { ...deal, status: overDeal.status }
              : deal
          )
        );

        toast.show({
          title: "Estado actualizado",
          description: `El negocio se movió a "${overDeal.status.name}"`,
          type: "success",
        });
      } catch {
        toast.show({
          title: "Error",
          description: "No se pudo actualizar el negocio",
          type: "error",
        });
      }
    }
  };

  const handleCreateDeal = async (dealData: DealFormData) => {
    try {
      const form = {
        title: dealData.name,
        amount: Number(dealData.value),
        closingDate: dealData.expectedCloseDate,
        associatedContactId: dealData.contact.id,
        pipeline: pipelineId,
        status: dealData.stage,
        fields: dealData.fields,
      };

      const response = await dealsService.createDeal(form as any);
      setDeals((prev) => [...prev, response.deal]);

      toast.show({
        title: "Negocio creado",
        description: "El nuevo negocio se ha creado exitosamente",
        type: "success",
      });

      setShowCreateDealModal(false);
    } catch (error) {
      console.error("Error creating deal:", error);
      toast.show({
        title: "Error",
        description: "No se pudo crear el negocio",
        type: "error",
      });
    }
  };

  const handleUpdateDeal = async (dealData: DealFormData) => {
    if (!editingDeal?._id) return;

    try {
      const form = {
        title: dealData.name,
        amount: Number(dealData.value),
        closingDate: dealData.expectedCloseDate,
        associatedContactId: dealData.contact.id,
        status: dealData.stage,
        fields: dealData.fields,
      };

      const response: Deal = await dealsService.updateDeal(
        editingDeal._id,
        form as any
      );

      setDeals((prev) =>
        prev.map((deal) => (deal._id === editingDeal._id ? response : deal))
      );

      toast.show({
        title: "Negocio actualizado",
        description: "El negocio se ha actualizado exitosamente",
        type: "success",
      });

      setEditingDeal(null);
    } catch (error) {
      console.error("Error updating deal:", error);
      toast.show({
        title: "Error",
        description: "No se pudo actualizar el negocio",
        type: "error",
      });
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col h-screen">
        <div className="bg-white border-b">
          <div className="p-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Negocios</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona tus oportunidades de venta
              </p>
            </div>
            <Button onClick={() => setShowCreateDealModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Negocio
            </Button>
          </div>
          {/* Filtros */}
          <DealFilters onFilterChange={() => {}} setDeals={setDeals} />
        </div>

        <div className="flex-1 overflow-x-auto p-6">
          {!deals.length || !columns.length ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-500">
                No hay negocios disponibles
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-6">
                {columns.map((column) => {
                  const columnDeals = deals.filter(
                    (deal) => deal.status._id === column._id
                  );

                  return (
                    <DealColumn
                      key={column._id}
                      column={column}
                      deals={columnDeals}
                      onDealClick={(deal) => setSelectedDeal(deal)}
                      handleDeleteDeal={handleDeleteDeal}
                    />
                  );
                })}
              </div>

              <DragOverlay>
                {activeDeal && (
                  <div style={{ opacity: 0.9 }}>
                    <DealCard
                      deal={activeDeal}
                      onView={setSelectedDeal}
                      onEdit={setEditingDeal}
                    />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      {/* Modal para crear/editar Deal */}
      <CreateDealModal
        isOpen={showCreateDealModal || Boolean(editingDeal)}
        onClose={() => {
          setShowCreateDealModal(false);
          setEditingDeal(null);
        }}
        onSubmit={editingDeal ? handleUpdateDeal : handleCreateDeal}
        initialStage={pipelineId}
        // initialData={editingDeal}
      />

      {/* Modal para Detalles de un Deal */}
      {selectedDeal && (
        <DealDetailsModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onEdit={() => {
            setEditingDeal(selectedDeal);
            setSelectedDeal(null);
          }}
        />
      )}
    </div>
  );
}
