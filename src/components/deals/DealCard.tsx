import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreVertical, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { Deal } from "../../types/deal";

interface DealCardProps {
  deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: deal._id,
      data: { type: "deal", deal },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all touch-none select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-action"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {deal.title}
          </h3>
        </div>
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing p-1"
          title="Arrastrar negocio"
        >
          <MoreVertical className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1">
        {deal.fields?.map((field: any) => (
          <p
            key={field.field.name}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
          >
            {field.field.name}: {field.value}
          </p>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
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
  );
}
