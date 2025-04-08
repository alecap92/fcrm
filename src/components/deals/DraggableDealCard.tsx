import React, { useState, MouseEvent } from "react";
import { MoreVertical, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Deal } from "../../types/deal";
import { Button } from "../ui/button";

interface DraggableDealCardProps {
  deal: Deal;
  onDealClick?: (deal: Deal) => void;
  onEdit?: (deal: Deal) => void;
  handleDeleteDeal?: (dealId: string) => void;
}

export function DraggableDealCard({
  deal,
  onDealClick,
  onEdit,
  handleDeleteDeal,
}: DraggableDealCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: deal._id as string });

  const handleTitleClick = (e: MouseEvent) => {
    e.stopPropagation();
    console.log(deal);
    onDealClick?.(deal);
  };

  const handleMenuToggle = (e: MouseEvent) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  const handleViewClick = (e: MouseEvent) => {
    e.stopPropagation();
    onDealClick?.(deal);
    setShowMenu(false);
  };

  const handleEditClick = (e: MouseEvent) => {
    e.stopPropagation();
    onEdit?.(deal);
    setShowMenu(false);
  };

  const handleDelete = (dealId: string) => {
    // Aquí puedes manejar la lógica de eliminación del deal
    handleDeleteDeal?.(dealId);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all select-none">
        <div className="flex items-start justify-between gap-2">
          {/* Título del deal */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-action relative z-10"
              onClick={handleTitleClick}
            >
              {deal.title}
            </h3>
          </div>

          {/* Botón de menú (View/Edit) */}
          <div className="relative z-10">
            <Button variant="ghost" size="sm" onClick={handleMenuToggle}>
              <MoreVertical className="w-4 h-4" />
            </Button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                <div className="py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleViewClick}
                  >
                    View Details
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleEditClick}
                  >
                    Edit Deal
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleDelete(deal._id as string)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de campos dinámicos (si los tienes) */}
        <div
          className="mt-4 flex flex-wrap gap-1 relative z-0"
          onClick={(e) => e.stopPropagation()}
        >
          {Array.isArray(deal.fields) &&
            deal.fields.map((field) => (
              <p
                key={field.field.name}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {field.field.name}: {field.value}
              </p>
            ))}
        </div>

        {/* Sección de monto y fecha de cierre */}
        <div
          className="mt-4 flex items-center justify-between relative z-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              ${deal.amount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            {format(new Date(deal.closingDate), "MMM d")}
          </div>
        </div>
      </div>
    </div>
  );
}
