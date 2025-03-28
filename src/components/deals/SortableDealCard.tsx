import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '../../types/deal';
import { DealCard } from './DealCard';

interface SortableDealCardProps {
  deal: Deal;
  onClick: (deal: Deal) => void;
}

export function SortableDealCard({ deal, onClick }: SortableDealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: deal.id });

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
    >
      <DealCard deal={deal} onClick={onClick} />
    </div>
  );
}