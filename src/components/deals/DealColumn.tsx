import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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
}

export function DealColumn({
  column,
  deals,
  onEditDeal,
  onDealClick,
  handleDeleteDeal,
}: DealColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
    data: { type: "column" },
  });

  const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);

  const columnStyle: React.CSSProperties = {
    transition: "transform 0.2s ease",
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col h-full min-w-[320px] max-w-[320px] rounded-lg transition-all
        ${
          isOver
            ? "bg-blue-50 border-blue-300 border-2 scale-105"
            : "bg-gray-50"
        }
      `}
      style={columnStyle}
    >
      {/* Encabezado de la columna */}
      <div className="p-3 bg-white rounded-t-lg border-b">
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

      {/* Contenido (tarjetas) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
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
      </div>
    </div>
  );
}
