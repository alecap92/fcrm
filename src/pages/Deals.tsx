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
import { Plus, Search, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { PipelineSelect } from "../components/deals/PipelineSelect";
import { CreateDealModal } from "../components/deals/CreateDealModal";
import { DealDetailsModal } from "../components/deals/DealDetailsModal";
import { DealColumn } from "../components/deals/DealColumn";
import { DealCard } from "../components/deals/DealCard";
import { SearchDealsModal } from "../components/deals/SearchDealsModal";
import { useDeals } from "../contexts/DealsContext";
import { useAuth } from "../contexts/AuthContext";
import { useChatModule } from "../components/chat/floating";

// Importamos los tipos que asumo tienes en tu proyecto

export function Deals() {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigate = useNavigate();
  const { organization } = useAuth();

  // Hook para integración con chat contextual
  const chatModule = useChatModule("deals");

  const {
    // Estado del contexto
    deals,
    columns,
    activeDeal,
    selectedDeal,
    editingDeal,
    showCreateDealModal,
    pagination,
    searchResults,
    pipelineId,

    // Setters del contexto
    setActiveDeal,
    setDeals,

    // Acciones del contexto
    fetchDeals,
    loadMoreDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    updateDealStatus,
    searchDeals,
    changePipeline,

    // Handlers para modales
    openCreateDealModal,
    closeCreateDealModal,
    openEditDealModal,
    openDealDetailsModal,
    closeDealDetailsModal,
  } = useDeals();

  // Verificar si hay configuraciones básicas de organización
  const hasBasicConfig = organization?.companyName && organization?.settings;

  // Actualizar contexto del chat cuando cambien los deals
  useEffect(() => {
    if (deals.length > 0) {
      chatModule.updateChatContext(deals, {
        currentPage: "deals",
        filters: { pipelineId },
        totalCount: deals.length,
      });

      // Agregar sugerencias específicas basadas en el estado actual
      if (
        deals.some((deal) =>
          deal.status?.name?.toLowerCase().includes("pending")
        )
      ) {
        chatModule.sendSuggestion("¿Qué deals necesitan seguimiento urgente?");
      }

      if (deals.length > 10) {
        chatModule.sendSuggestion("Muéstrame estadísticas de conversión");
      }
    }
  }, [deals, columns, pipelineId, pagination.hasNextPage]);

  // Si no hay configuraciones básicas, mostrar mensaje de configuración
  if (!hasBasicConfig) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full mx-4">
          <div className="text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Configuración Requerida
            </h2>
            <p className="text-gray-600 mb-6">
              Para gestionar negocios necesitas configurar primero tu
              organización y crear pipelines de ventas. Esto te permitirá
              organizar y hacer seguimiento a tus oportunidades de negocio.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Configura la organización y el pipeline para empezar
              </p>
              <Button onClick={() => navigate("/settings")} className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Ir a Configuración
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  // Función para manejar el scroll infinito por columna
  const handleLoadMoreForColumn = () => {
    // Solo cargar más si hay más páginas disponibles y no se está cargando ya
    if (pagination.hasNextPage && !pagination.isLoadingMore) {
      loadMoreDeals();
    }
  };

  const handleSearchDeal = (deal: any) => {
    openDealDetailsModal(deal);
  };

  const handlePipelineChange = async (newPipelineId: string) => {
    await changePipeline(newPipelineId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col h-screen">
        <div className="bg-white border-b">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Negocios
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Gestiona tus oportunidades de venta
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSearchModal(true)}
                  className="flex items-center"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
                <div className="relative">
                  <PipelineSelect
                    selectedPipelineId={pipelineId}
                    onPipelineChange={handlePipelineChange}
                  />
                </div>
                {/* Botón de filtros comentado temporalmente */}
                {/* <div className="relative">
                  <DealFilters
                    onFilterChange={() => {}}
                    setDeals={setDeals}
                    fetchDeals={fetchDeals}
                  />
                </div> */}
                <Button onClick={openCreateDealModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Negocio
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto p-6">
          {!columns.length ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  No hay pipelines configurados
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Configura pipelines en ajustes para organizar tus negocios
                </p>
                <Button onClick={() => navigate("/settings")} size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Pipelines
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Mensaje informativo cuando hay columnas pero no hay deals */}
              {columns.length > 0 && deals.length === 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Este pipeline no tiene negocios aún. Puedes crear uno nuevo
                    haciendo clic en "Nuevo Negocio" o arrastrando deals desde
                    otros pipelines.
                  </p>
                </div>
              )}

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
                        onLoadMore={() => handleLoadMoreForColumn()}
                        isLoadingMore={pagination.isLoadingMore}
                        hasNextPage={pagination.hasNextPage}
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
            </>
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

      {/* Modal de búsqueda */}
      <SearchDealsModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSubmit={searchDeals}
        searchResults={searchResults}
        onDealClick={handleSearchDeal}
      />
    </div>
  );
}
