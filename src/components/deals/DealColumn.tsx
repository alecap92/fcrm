import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useRef, useEffect } from "react";

import type { Deal } from "../../types/deal";
import { DraggableDealCard } from "./DraggableDealCard";

interface DealStage {
  _id: string;
  name: string;
  color: string;
}

interface DealColumnProps {
  column: DealStage;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onEditDeal?: (deal: Deal) => void;
  onViewDeal?: (deal: Deal) => void;
  handleDeleteDeal?: (dealId: string) => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasNextPage?: boolean;
}

export function DealColumn({
  column,
  deals,
  onEditDeal,
  onDealClick,
  handleDeleteDeal,
  onLoadMore,
  isLoadingMore = false,
  hasNextPage = false,
}: DealColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
    data: { type: "column" },
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);

  const columnStyle: React.CSSProperties = {
    transition: "transform 0.2s ease",
  };

  // Función para detectar cuando se llega al final del scroll
  const handleScroll = useCallback(() => {
    if (
      !scrollContainerRef.current ||
      !onLoadMore ||
      !hasNextPage ||
      isLoadingMore
    ) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const threshold = 100; // Cargar más cuando falten 100px para llegar al final

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      onLoadMore();
    }
  }, [onLoadMore, hasNextPage, isLoadingMore]);

  // Agregar event listener para el scroll
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col min-w-[320px] max-w-[320px] rounded-lg transition-all
        ${
          isOver
            ? "bg-blue-50 border-blue-300 border-2 scale-105"
            : "bg-gray-50"
        }
      `}
      style={{
        ...columnStyle,
        height: "calc(100vh - 200px)", // Altura máxima basada en el viewport
        maxHeight: "calc(100vh - 200px)",
      }}
    >
      {/* Encabezado de la columna */}
      <div className="p-3 bg-white rounded-t-lg border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h3 className="font-medium text-gray-900">{column.name}</h3>
          </div>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md">
          ${totalValue.toLocaleString()}
        </div>
      </div>

      {/* Contenido (tarjetas) con scroll */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0"
        style={{ scrollBehavior: "smooth" }}
      >
        <SortableContext
          items={deals.map((deal) => deal._id as string)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DraggableDealCard
              key={deal._id}
              deal={deal}
              onDealClick={onDealClick}
              onEdit={onEditDeal}
              handleDeleteDeal={handleDeleteDeal}
            />
          ))}
        </SortableContext>

        {/* Indicador de carga */}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-500">Cargando más...</span>
          </div>
        )}

        {/* Zona final o "placeholder" cuando la columna está vacía */}
        <div
          className={`
            h-20 rounded-lg flex items-center justify-center transition-all 
            ${
              deals.length === 0 || isOver
                ? "border-2 border-dashed border-gray-300"
                : ""
            }
          `}
        >
          {deals.length === 0 && (
            <p className="text-sm text-gray-500">Arrastra un negocio aquí</p>
          )}
        </div>

        {/* Mensaje cuando no hay más deals para cargar */}
        {!hasNextPage && deals.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <span className="text-sm text-gray-400">No hay más negocios</span>
          </div>
        )}
      </div>
    </div>
  );
}
