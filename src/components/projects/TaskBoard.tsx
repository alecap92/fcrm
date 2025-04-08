import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { TaskColumn } from "./TaskColumn";
import { TaskItem } from "./TaskItem"; // Cambiado de TaskCard a TaskItem
import type { Task, Column } from "../../types/task";

interface TaskBoardProps {
  columns: Column[];
  tasks: Task[];
  activeTask: Task | null;
  setActiveTask: (task: Task | null) => void;
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  onAddTask: (status: string) => void;
  showTaskMenu: string | null;
  onTaskMenuToggle: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskBoard({
  columns,
  tasks,
  activeTask,
  setActiveTask,
  moveTask,
  onAddTask,
  showTaskMenu,
  onTaskMenuToggle,
  onDeleteTask,
}: TaskBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over) {
      const task = tasks.find((t) => t.id === active.id);
      const newStatus = over.id as Task["status"];

      if (task && task.status !== newStatus) {
        moveTask(task.id, newStatus);
      }
    }
    setActiveTask(null);
  };

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <div className="h-full p-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            {columns.map((column) => {
              const columnTasks = tasks.filter(
                (task) => task.status === column.id
              );

              return (
                <TaskColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  activeTaskId={activeTask?.id || null}
                  onAddTask={onAddTask}
                  onTaskMenuToggle={onTaskMenuToggle}
                  showTaskMenu={showTaskMenu}
                  onDeleteTask={onDeleteTask}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="transform-gpu">
                <TaskItem
                  task={activeTask}
                  isDragging={true}
                  // No necesitamos pasar los otros props porque en el DragOverlay
                  // solo queremos mostrar la tarjeta, no interactuar con ella
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
