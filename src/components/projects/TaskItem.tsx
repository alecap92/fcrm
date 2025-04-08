import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { MoreVertical, Calendar, Tag as TagIcon, Trash2 } from "lucide-react";
import type { Task } from "../../types/task";

interface TaskItemProps {
  task: Task;
  isActive?: boolean;
  showMenu?: boolean;
  onMenuToggle?: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
}

export function TaskItem({
  task,
  isActive = false,
  showMenu = false,
  onMenuToggle = () => {},
  onDelete = () => {},
  isDragging: externalIsDragging,
}: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dndIsDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: "Task",
      task,
    },
  });

  // Use external isDragging if provided, otherwise use the one from dnd-kit
  const isDragging =
    externalIsDragging !== undefined ? externalIsDragging : dndIsDragging;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-800";

      case "Media":
        return "bg-yellow-100 text-yellow-800";

      case "Baja":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative
        ${isDragging ? "opacity-100 z-10" : "opacity-100 z-10"}
      `}
    >
      <div
        className={`
          bg-white rounded-lg shadow-sm border p-4 
          hover:shadow-md transition-all touch-none select-none
          ${isActive ? "ring-2 ring-action" : ""}
          ${isDragging ? "shadow-xl" : ""}
        `}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-700 ">{task.title}</h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {task.description}
            </p>
          </div>
          <button
            className="p-1 rounded-md hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle();
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {task?.tags?.map((tag) => (
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
              {task?.assignees?.map((assignee) => (
                <img
                  key={assignee.id}
                  src={assignee.avatar}
                  alt={assignee.name}
                  className="w-6 h-6 rounded-full ring-2 ring-white"
                  title={assignee.name}
                />
              ))}
            </div>
            <span
              className={`
                ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                ${getPriorityColor(task.priority)}
              `}
            >
              {task.priority}
            </span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            {format(new Date(task.dueDate), "MMM d")}
          </div>
        </div>
      </div>

      {showMenu && (
        <div className="absolute right-0 top-8 z-20 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
