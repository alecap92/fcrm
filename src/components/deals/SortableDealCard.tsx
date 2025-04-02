import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Deal } from "../../types/deal";
import { DealCard } from "./DealCard";

interface SortableDealCardProps {
  deal: Deal;
  onClick: (deal: Deal) => void;
  onEdit?: (deal: Deal) => void;
  onView?: (deal: Deal) => void;
}

export function SortableDealCard({
  deal,
  onClick,
  onEdit,
  onView,
}: SortableDealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: deal._id,
      data: { type: "deal", deal },
    });

  // Generamos el estilo para la animación del desplazamiento
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Retornamos un contenedor que wrappea la DealCard
  // y hereda los atributos necesarios (attributes, listeners)
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onClick?.(deal)}
      {...attributes}
      {...listeners}
    >
      <DealCard deal={deal} onEdit={onEdit} onView={onView} />
    </div>
  );
}
