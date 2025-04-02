import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  CheckSquare,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Settings,
  Star,
  Clock,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { Button } from "../components/ui/button";
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
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "../components/projects/TaskCard";
import { useTaskStore } from "../store/taskStore";
import type { Task } from "../types/task";
import { format } from "date-fns";

export function Projects() {
  const {
    projects,
    tasks,
    columns,
    selectedProject,
    setSelectedProject,
    toggleProjectExpanded,
    activeTask,
    setActiveTask,
    moveTask,
  } = useTaskStore();

  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredTasks = tasks.filter(
    (task) =>
      (!selectedProject || task.projectId === selectedProject) &&
      (task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getColumnMetrics = (columnId: string) => {
    const columnTasks = filteredTasks.filter(
      (task) => task.status === columnId
    );

    const totalTasks = columnTasks.length;
    const highPriority = columnTasks.filter(
      (task) => task.priority === "high"
    ).length;
    const dueSoon = columnTasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const diffDays = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays <= 3;
    }).length;

    return { totalTasks, highPriority, dueSoon };
  };

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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white flex-shrink-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-900">Proyectos</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" title="Configuración">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" title="Nuevo Proyecto">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-2">
          <button className="w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-gray-50 mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-900">Favoritos</span>
          </button>
          {projects.map((project) => (
            <div key={project.id} className="mb-1">
              <button
                className={`
                  w-full flex items-center gap-2 p-2 rounded-lg text-left
                  ${
                    selectedProject === project.id
                      ? "bg-action/10 text-action"
                      : "hover:bg-gray-50"
                  }
                `}
                onClick={() =>
                  setSelectedProject(
                    selectedProject === project.id ? null : project.id
                  )
                }
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="flex-1 text-sm font-medium truncate">
                  {project.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProjectExpanded(project.id);
                  }}
                >
                  {project.isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </button>
              {project.isExpanded && (
                <div className="ml-4 pl-4 border-l">
                  <button
                    className={`
                      w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm text-gray-500
                      hover:bg-gray-50
                    `}
                  >
                    <CheckSquare className="w-4 h-4" />
                    Tareas
                  </button>
                  <button
                    className={`
                      w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm text-gray-500
                      hover:bg-gray-50
                    `}
                  >
                    <Calendar className="w-4 h-4" />
                    Calendario
                  </button>
                  <button
                    className={`
                      w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm text-gray-500
                      hover:bg-gray-50
                    `}
                  >
                    <Users className="w-4 h-4" />
                    Miembros
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Proyectos y Tareas
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Gestiona tus proyectos y tareas en un solo lugar
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 rounded-lg p-1 flex items-center">
                  <button
                    className={`p-1.5 rounded ${
                      viewMode === "board"
                        ? "bg-white shadow"
                        : "hover:bg-white/50"
                    }`}
                    onClick={() => setViewMode("board")}
                    title="Vista Tablero"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-1.5 rounded ${
                      viewMode === "list"
                        ? "bg-white shadow"
                        : "hover:bg-white/50"
                    }`}
                    onClick={() => setViewMode("list")}
                    title="Vista Lista"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Tarea
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar tareas..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 flex flex-wrap gap-2 p-4 bg-white rounded-lg border">
                <select className="text-sm rounded-md border-gray-300">
                  <option>Todas las prioridades</option>
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
                <select className="text-sm rounded-md border-gray-300">
                  <option>Todas las etiquetas</option>
                  <option>Frontend</option>
                  <option>Backend</option>
                  <option>Design</option>
                </select>
                <select className="text-sm rounded-md border-gray-300">
                  <option>Todos los asignados</option>
                  <option>Sin asignar</option>
                  <option>Asignados a mí</option>
                </select>
                <select className="text-sm rounded-md border-gray-300">
                  <option>Fecha de vencimiento</option>
                  <option>Hoy</option>
                  <option>Esta semana</option>
                  <option>Este mes</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Board/List View */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "board" ? (
            <div className="h-full overflow-x-auto overflow-y-hidden">
              <div className="h-full p-6">
                <DndContext
                  sensors={sensors}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex gap-4 h-full">
                    {columns.map((column) => {
                      const metrics = getColumnMetrics(column.id);
                      return (
                        <div
                          key={column.id}
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
                              <Button variant="ghost" size="sm">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                              {column.description}
                            </p>
                            {(metrics.highPriority > 0 ||
                              metrics.dueSoon > 0) && (
                              <div className="mt-2 flex gap-2">
                                {metrics.highPriority > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs">
                                    <AlertCircle className="w-3 h-3" />
                                    {metrics.highPriority} alta prioridad
                                  </span>
                                )}
                                {metrics.dueSoon > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 text-xs">
                                    <Clock className="w-3 h-3" />
                                    {metrics.dueSoon} próximos a vencer
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 overflow-y-auto p-2">
                            <SortableContext
                              items={filteredTasks
                                .filter((task) => task.status === column.id)
                                .map((task) => task.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="space-y-2">
                                {filteredTasks
                                  .filter((task) => task.status === column.id)
                                  .map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                  ))}
                              </div>
                            </SortableContext>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <DragOverlay>
                    {activeTask && <TaskCard task={activeTask} />}
                  </DragOverlay>
                </DndContext>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto p-6">
              <div className="bg-white rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarea
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridad
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asignado
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 bg-gray-50"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {task.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {task.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              task.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : task.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex -space-x-2">
                            {task.assignees.map((assignee) => (
                              <img
                                key={assignee.id}
                                className="w-6 h-6 rounded-full ring-2 ring-white"
                                src={assignee.avatar}
                                alt={assignee.name}
                                title={assignee.name}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(task.dueDate), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
