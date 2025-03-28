import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Deal, DealColumn as DealColumnType } from "../../types/deal";
import { SortableDealCard } from "./SortableDealCard";

interface DealColumnProps {
  column: DealColumnType;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

export function DealColumn({ column, deals, onDealClick }: DealColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
  });

  const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full min-w-[320px] max-w-[320px] rounded-lg transition-colors
        ${isOver ? "bg-blue-50 border-blue-300 border-2" : "bg-gray-50"}
      `}
    >
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

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <SortableContext
          items={deals.map((deal) => deal._id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <SortableDealCard
              key={deal._id}
              deal={deal}
              onClick={onDealClick}
            />
          ))}
        </SortableContext>

        {/* Zona final siempre visible para mejorar usabilidad */}
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
