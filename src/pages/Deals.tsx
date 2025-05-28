import { useEffect } from "react";
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
import { DealColumn } from "../components/deals/DealColumn";
import { DealCard } from "../components/deals/DealCard";
import { useDeals } from "../contexts/DealsContext";

// Importamos los tipos que asumo tienes en tu proyecto
import type { Deal } from "../types/deal";

export function Deals() {
  const {
    // Estado del contexto
    deals,
    columns,
    activeDeal,
    selectedDeal,
    editingDeal,
    showCreateDealModal,

    // Setters del contexto
    setActiveDeal,
    setDeals,

    // Acciones del contexto
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
  } = useDeals();

  // Creamos un sensor para manejar press delay en móviles
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 5,
    },
  });

  // Agrupamos nuestros sensores
  const sensors = useSensors(pointerSensor);

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
      await updateDealStatus(
        draggedDeal._id as string,
        targetColumn._id,
        targetColumn.name
      );
    } else if (overDeal) {
      // Significa que se soltó sobre otro DealCard
      await updateDealStatus(
        draggedDeal._id as string,
        overDeal.status._id,
        overDeal.status.name
      );
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
            <Button onClick={openCreateDealModal}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Negocio
            </Button>
          </div>
          {/* Filtros */}
          <DealFilters
            onFilterChange={() => {}}
            setDeals={setDeals}
            fetchDeals={fetchDeals}
          />
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
                {columns?.map((column) => {
                  const columnDeals = deals.filter(
                    (deal) => deal?.status?._id === column._id
                  );

                  return (
                    <DealColumn
                      key={column._id}
                      column={column}
                      deals={columnDeals}
                      onDealClick={openDealDetailsModal}
                      onEditDeal={openEditDealModal}
                      handleDeleteDeal={deleteDeal}
                    />
                  );
                })}
              </div>

              <DragOverlay>
                {activeDeal && (
                  <div style={{ opacity: 0.9 }}>
                    <DealCard
                      deal={activeDeal}
                      onView={openDealDetailsModal}
                      onEdit={openEditDealModal}
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
        onClose={closeCreateDealModal}
        onSubmit={editingDeal ? updateDeal : createDeal}
        initialStage={""} // El contexto maneja el pipelineId internamente
        initialData={editingDeal}
      />

      {/* Modal para Detalles de un Deal */}
      {selectedDeal && (
        <DealDetailsModal
          deal={selectedDeal}
          onClose={closeDealDetailsModal}
          onEdit={() => {
            openEditDealModal(selectedDeal);
            closeDealDetailsModal();
          }}
        />
      )}
    </div>
  );
}
