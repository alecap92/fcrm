import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Button } from "../components/ui/button";
import { DealColumn } from "../components/deals/DealColumn";
import { DealFilters } from "../components/deals/DealFilters";
import { CreateDealModal } from "../components/deals/CreateDealModal";
import { DealCard } from "../components/deals/DealCard";
import { DealDetailsModal } from "../components/deals/DealDetailsModal";
import { useToast } from "../components/ui/toast";
import type { Deal, DealStage } from "../types/deal";
import { dealsService } from "../services/dealsService";

export function Deals() {
  const [deals, setDeals] = useState<Deal[]>([
    {
      _id: "1",
      title: "Negocio 1",
      associatedContactId: {
        _id: "contact_1",
        properties: {},
      },
      amount: 1000,
      closingDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: {},
      organizationId: "org_1",
      pipeline: "pipeline_1",
      status: {
        _id: "lead",
        name: "Lead",
        color: "#FF0000",
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pipelineId: "pipeline_1",
      },
    },
  ]);
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const toast = useToast();
  const [columns, setColumns] = useState([
    {
      _id: "123",
      name: "Propuestas",
      order: 1,
    },
  ]);

  const pipelineId = "66c6370ad573dacc51e620f0";

  const fetchDeals = async () => {
    try {
      const response = await dealsService.getDeals(pipelineId);
      const statuses = await dealsService.getStatuses(pipelineId);

      setColumns(statuses || []);
      setDeals(response || []);
    } catch (error) {
      console.error("Error fetching deals:", error);
      setDeals([]);
      setColumns([]);
      toast.show({
        title: "Error",
        description: "No se pudieron cargar los negocios",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedDeal = deals.find((deal) => deal._id === active.id);
    if (draggedDeal) {
      setActiveDeal(draggedDeal);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const draggedDealId = active.id;
    const newStage = over.id as DealStage;

    // Validate that the new stage exists in our columns
    const targetColumn = columns.find((col) => col._id === newStage);
    if (!targetColumn) {
      toast.show({
        title: "Error",
        description: "Etapa no válida",
        type: "error",
      });
      return;
    }

    const draggedDeal = deals.find((deal) => deal._id === draggedDealId);
    if (!draggedDeal) {
      toast.show({
        title: "Error",
        description: "Negocio no encontrado",
        type: "error",
      });
      return;
    }

    // Only update if the stage actually changed
    if (draggedDeal.status._id !== newStage) {
      // Update the deal's status in the backend

      const updateDeal = await dealsService.updateDealStatus(draggedDeal._id, {
        status: targetColumn._id,
      });

      if (!updateDeal) {
        toast.show({
          title: "Error",
          description: "No se pudo actualizar el negocio",
          type: "error",
        });
        return;
      }

      // Update the local state
      setDeals((currentDeals: any) =>
        currentDeals.map((deal: any) =>
          deal._id === draggedDealId ? { ...deal, status: targetColumn } : deal
        )
      );
      // Show success toast

      toast.show({
        title: "Estado actualizado",
        description: `El negocio se ha movido a "${targetColumn.name}"`,
        type: "success",
      });
    }
  };

  const handleCreateDeal = (
    dealData: Omit<Deal, "id" | "createdAt" | "updatedAt">
  ) => {
    const newDeal: Deal = {
      ...dealData,
      _id: `deal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDeals((currentDeals) => [...currentDeals, newDeal]);
    toast.show({
      title: "Negocio creado",
      description: "El nuevo negocio se ha creado exitosamente",
      type: "success",
    });
  };

  const handleSelectDeal = (deal: Deal) => {
    setSelectedDeal(deal);
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
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="flex gap-6">
                {columns.map((column) => {
                  const columnDeals = deals.filter(
                    (deal) => deal.status._id === column._id
                  );

                  return (
                    <SortableContext
                      key={column._id}
                      items={columnDeals.map((d) => d._id)}
                    >
                      <DealColumn
                        column={column}
                        deals={columnDeals}
                        onDealClick={handleSelectDeal}
                      />
                    </SortableContext>
                  );
                })}
              </div>

              <DragOverlay>
                {activeDeal && <DealCard deal={activeDeal} />}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      <CreateDealModal
        isOpen={showCreateDealModal}
        onClose={() => setShowCreateDealModal(false)}
        onSubmit={handleCreateDeal}
        initialStage="lead"
      />

      {selectedDeal && (
        <DealDetailsModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
