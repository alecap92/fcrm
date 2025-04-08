import { useEffect, useState } from "react";
import { useTaskStore } from "../store/taskStore";
import type { Task } from "../types/task";
import { Loader2 } from "lucide-react";

// Import components
import { ProjectSidebar } from "../components/projects/ProjectSidebar";
import { ProjectHeader } from "../components/projects/ProjectHeader";
import { TaskBoard } from "../components/projects/TaskBoard";
import { TaskList } from "../components/projects/TaskList";
import { AddProjectModal } from "../components/projects/AddProjectModal";
import { AddTaskModal } from "../components/projects/AddTaskModal";
import { DeleteTaskModal } from "../components/projects/DeleteTaskModal";
import { useToast } from "../components/ui/toast";

export function Projects() {
  const {
    // Estado
    projects,
    tasks,
    columns,
    selectedProject,
    activeTask,
    isLoadingProjects,
    isLoadingTasks,
    error,

    // Acciones
    setSelectedProject,
    setActiveTask,
    moveTask,

    // Acciones asíncronas
    fetchProjects,
    fetchTasks,
    createProject,
    createTask,
    deleteTask,
  } = useTaskStore();

  // UI state
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [showTaskMenu, setShowTaskMenu] = useState<string | null>(null);
  const [initialTaskStatus, setInitialTaskStatus] = useState("todo");

  const toast = useToast();

  // Filter tasks based on selected project and search term
  const filteredTasks = tasks.filter(
    (task) =>
      (!selectedProject || task.projectId === selectedProject) &&
      (task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handlers
  const handleAddProject = (projectData: any) => {
    createProject(projectData).then(() => {
      setShowAddProjectModal(false);
    });
  };

  const handleAddTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    createTask(taskData).then(() => {
      setShowAddTaskModal(false);
    });
  };

  const handleDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete).then(() => {
        setTaskToDelete(null);
        setShowTaskMenu(null);

        toast.show({
          title: "Tarea eliminada",
          description: "La tarea se ha eliminado correctamente.",
          type: "success",
        });
      });
    }
  };

  const handleTaskMenuToggle = (taskId: string) => {
    setShowTaskMenu(showTaskMenu === taskId ? null : taskId);
  };

  const handleOpenAddTaskModal = (status?: string) => {
    if (status) {
      setInitialTaskStatus(status);
    }
    setShowAddTaskModal(true);
  };

  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProjects();
  }, []);

  // Cargar tareas cuando cambia el proyecto seleccionado
  useEffect(() => {
    fetchTasks(selectedProject || undefined);
  }, [selectedProject]);

  // Componente de carga durante la carga inicial de proyectos
  if (isLoadingProjects && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de error si hay algún problema
  if (error && !isLoadingProjects && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error al cargar datos
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchProjects()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  // Skeleton loader for projects sidebar
  const ProjectSidebarSkeleton = () => (
    <div className="w-64 border-r bg-white flex-shrink-0 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Skeleton loader for task board
  const TaskBoardSkeleton = () => (
    <div className="flex-1 p-6">
      <div className="flex gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-80 flex flex-col bg-gray-100 rounded-lg"
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex-1 p-2 space-y-2">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="bg-white rounded-lg shadow-sm border p-4 animate-pulse"
                >
                  <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-1">
                      <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Skeleton loader for task list
  const TaskListSkeleton = () => (
    <div className="flex-1 p-6">
      <div className="bg-white rounded-lg border">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50"></th>
              <th className="px-6 py-3 bg-gray-50"></th>
              <th className="px-6 py-3 bg-gray-50"></th>
              <th className="px-6 py-3 bg-gray-50"></th>
              <th className="px-6 py-3 bg-gray-50"></th>
              <th className="px-6 py-3 bg-gray-50"></th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-t">
                <td className="px-6 py-4">
                  <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mt-2"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      {isLoadingProjects ? (
        <ProjectSidebarSkeleton />
      ) : (
        <ProjectSidebar
          projects={projects}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          onAddProject={() => setShowAddProjectModal(true)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <ProjectHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddTask={() => handleOpenAddTaskModal()}
        />

        {/* Board/List View */}
        <div className="flex-1 overflow-hidden relative">
          {/* Overlay de carga para tareas */}
          {isLoadingTasks && tasks.length > 0 && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          )}

          {isLoadingTasks && tasks.length === 0 ? (
            viewMode === "board" ? (
              <TaskBoardSkeleton />
            ) : (
              <TaskListSkeleton />
            )
          ) : viewMode === "board" ? (
            <TaskBoard
              columns={columns}
              tasks={filteredTasks}
              activeTask={activeTask}
              setActiveTask={setActiveTask}
              moveTask={moveTask}
              onAddTask={handleOpenAddTaskModal}
              showTaskMenu={showTaskMenu}
              onTaskMenuToggle={handleTaskMenuToggle}
              onDeleteTask={setTaskToDelete}
            />
          ) : (
            <TaskList tasks={filteredTasks} onDeleteTask={setTaskToDelete} />
          )}
        </div>
      </div>

      {/* Modals */}
      <AddProjectModal
        isOpen={showAddProjectModal}
        onClose={() => setShowAddProjectModal(false)}
        onSubmit={handleAddProject}
      />

      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onSubmit={handleAddTask}
        projects={projects}
        columns={columns}
        initialStatus={initialTaskStatus}
        selectedProject={selectedProject}
      />

      <DeleteTaskModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
}
