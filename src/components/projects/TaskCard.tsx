import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  MoreVertical,
  Calendar,
  Tag as TagIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import type { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'Task',
      task,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg shadow-sm border p-4 
        hover:shadow-md transition-all touch-none select-none
        ${isDragging ? 'opacity-50 shadow-xl scale-105' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {task.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {task.description}
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-1">
        {task.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
          >
            <TagIcon className="w-3 h-3 mr-1" />
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {task.assignees.map((assignee) => (
              <img
                key={assignee.id}
                src={assignee.avatar}
                alt={assignee.name}
                className="w-6 h-6 rounded-full ring-2 ring-white"
                title={assignee.name}
              />
            ))}
          </div>
          <span className={`
            ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
            ${getPriorityColor(task.priority)}
          `}>
            {task.priority}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          {format(new Date(task.dueDate), 'MMM d')}
        </div>
      </div>
    </div>
  );
}