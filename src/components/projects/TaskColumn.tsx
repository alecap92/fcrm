import { useMemo } from "react";
import { Plus, AlertCircle, Clock } from "lucide-react";
import { Button } from "../ui/button";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskItem } from "./TaskItem";
import type { Task, Column } from "../../types/task";

interface TaskColumnProps {
  column: Column;
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (status: string) => void;
  onTaskMenuToggle: (taskId: string) => void;
  showTaskMenu: string | null;
  onDeleteTask: (taskId: string) => void;
}

export function TaskColumn({
  column,
  tasks,
  activeTaskId,
  onAddTask,
  onTaskMenuToggle,
  showTaskMenu,
  onDeleteTask,
}: TaskColumnProps) {
  // Calculate metrics for this column
  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    const highPriority = tasks.filter(
      (task) => task.priority === "Alta"
    ).length;
    const dueSoon = tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const diffDays = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays <= 3;
    }).length;

    return { totalTasks, highPriority, dueSoon };
  }, [tasks]);

  return (
    <div
      id={column.id}
      className="flex-shrink-0 w-80 flex flex-col bg-gray-100 rounded-lg"
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h3 className="text-sm font-medium text-gray-900">
              {column.title}
            </h3>
            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
              {metrics.totalTasks}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTask(column.id)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500">{column.description}</p>
        {(metrics.highPriority > 0 || metrics.dueSoon > 0) && (
          <div className="mt-2 flex gap-2">
            {metrics.highPriority > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs">
                <AlertCircle className="w-3 h-3" />
                {metrics.highPriority} high priority
              </span>
            )}
            {metrics.dueSoon > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 text-xs">
                <Clock className="w-3 h-3" />
                {metrics.dueSoon} due soon
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isActive={task.id === activeTaskId}
                showMenu={task.id === showTaskMenu}
                onMenuToggle={() => onTaskMenuToggle(task.id)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
