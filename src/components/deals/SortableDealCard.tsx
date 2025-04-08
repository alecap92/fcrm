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
      id: deal._id as string,
      data: { type: "deal", deal },
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      !(
        e.target instanceof HTMLButtonElement ||
        e.target instanceof HTMLHeadingElement
      )
    ) {
      onClick(deal);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="touch-none cursor-grab active:cursor-grabbing relative z-0"
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <DealCard deal={deal} onEdit={onEdit} onView={onView} />
    </div>
  );
}
