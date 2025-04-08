import { create } from "zustand";
import type { Task, Column } from "../types/task";
import projectsService from "../services/projectsService";

// Definición actualizada de Project basada en el uso actual
export interface Project {
  _id: string;
  name: string;
  description: string;
  color: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  organizationId: string;
  ownerId: string;
  status: string;
}

interface TaskState {
  // Estado
  tasks: Task[];
  projects: Project[];
  columns: Column[];
  selectedProject: string | null;
  activeTask: Task | null;
  isLoadingProjects: boolean;
  isLoadingTasks: boolean;
  error: string | null;

  // Acciones sincrónicas
  setTasks: (tasks: Task[]) => void;
  setProjects: (projects: Project[]) => void;
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  setActiveTask: (task: Task | null) => void;
  setSelectedProject: (projectId: string | null) => void;
  toggleProjectExpanded: (projectId: string) => void;

  // Acciones asincrónicas para proyectos
  fetchProjects: () => Promise<void>;
  getProjectById: (id: string) => Promise<void>;
  createProject: (projectData: Omit<Project, "_id">) => Promise<void>;
  updateProject: (
    id: string,
    projectData: Partial<Omit<Project, "_id">>
  ) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Acciones asincrónicas para tareas
  fetchTasks: (projectId?: string) => Promise<void>;
  getTaskById: (id: string) => Promise<void>;
  createTask: (taskData: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (
    id: string,
    taskData: Partial<Omit<Task, "id">>
  ) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // Estado inicial
  tasks: [],
  projects: [],
  columns: [
     {
      id: "No Iniciado",
      title: "No Iniciado",
      color: "#6B7280",
      description: "Ideas and tasks to be planned",
    },
    {
      id: "En Progreso",
      title: "En Progreso",
      color: "#3B82F6",
      description: "Tasks ready to be worked on",
    },
    {
      id: "Completado",
      title: "Completado",
      color: "#10B981",
      description: "Tasks currently being worked on",
    },
    {
      id: "Atrasado",
      title: "Atrasado",
      color: "#F59E0B",
      description: "Tasks ready for review",
    },
    {
      id: "Cancelado",
      title: "Cancelado",
      color: "#6366F1",
      description: "Completed tasks",
    },
  ],

  selectedProject: null,
  activeTask: null,
  isLoadingProjects: true,
  isLoadingTasks: true,
  error: null,

  // Acciones sincrónicas
  setTasks: (tasks) => set({ tasks }),
  setProjects: (projects) => set({ projects }),

  moveTask: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ),
    })),

  setActiveTask: (task) => set({ activeTask: task }),
  setSelectedProject: (projectId) => set({ selectedProject: projectId }),

  toggleProjectExpanded: (projectId) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project._id === projectId ? { ...project } : project
      ),
    })),

  // Acciones asincrónicas para proyectos
  fetchProjects: async () => {
    set({ isLoadingProjects: true, error: null });
    try {
      const response = await projectsService.getProjects(1, 10);
      set({
        projects: response.data,
        isLoadingProjects: false,
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      set({
        isLoadingProjects: false,
        error: "Failed to load projects. Please try again.",
      });
    }
  },

  getProjectById: async (id) => {
    set({ isLoadingProjects: true, error: null });
    try {
      const response = await projectsService.getProjectById(id);
      // Normalmente actualizarías un proyecto específico o lo establecerías como seleccionado
      // Aquí solo lo añadimos al store si no existe
      set((state) => {
        const exists = state.projects.some((project) => project._id === id);
        if (!exists) {
          return {
            projects: [...state.projects, response.data.data],
            isLoadingProjects: false,
          };
        }
        return { isLoadingProjects: false };
      });
    } catch (error) {
      console.error("Error fetching project details:", error);
      set({
        isLoadingProjects: false,
        error: "Failed to load project details. Please try again.",
      });
    }
  },

  createProject: async (projectData) => {
    set({ isLoadingProjects: true, error: null });
    try {
      const response = await projectsService.createProject(projectData);
      set((state) => ({
        projects: [...state.projects, response.data.data],
        isLoadingProjects: false,
      }));
    } catch (error) {
      console.error("Error creating project:", error);
      set({
        isLoadingProjects: false,
        error: "Failed to create project. Please try again.",
      });
    }
  },

  updateProject: async (id, projectData) => {
    set({ isLoadingProjects: true, error: null });
    try {
      const response = await projectsService.updateProject(id, projectData);
      set((state) => ({
        projects: state.projects.map((project) =>
          project._id === id ? response.data.data : project
        ),
        isLoadingProjects: false,
      }));
    } catch (error) {
      console.error("Error updating project:", error);
      set({
        isLoadingProjects: false,
        error: "Failed to update project. Please try again.",
      });
    }
  },

  deleteProject: async (id) => {
    set({ isLoadingProjects: true, error: null });
    try {
      await projectsService.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((project) => project._id !== id),
        selectedProject:
          state.selectedProject === id ? null : state.selectedProject,
        isLoadingProjects: false,
      }));
    } catch (error) {
      console.error("Error deleting project:", error);
      set({
        isLoadingProjects: false,
        error: "Failed to delete project. Please try again.",
      });
    }
  },

  // Acciones asincrónicas para tareas
  fetchTasks: async (projectId) => {
    set({ isLoadingTasks: true, error: null });
    try {
      // Asumiendo que projectsService tiene un método getTasks
      // Ajusta según la estructura real de tu API
      const response = await projectsService.getTasks(projectId);

      set({
        tasks: response.data,
        isLoadingTasks: false,
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      set({
        isLoadingTasks: false,
        error: "Failed to load tasks. Please try again.",
      });
    }
  },

  getTaskById: async (id) => {
    set({ isLoadingTasks: true, error: null });
    try {
      // Asumiendo que projectsService tiene un método getTaskById
      const response = await projectsService.getTaskById(id);
      set((state) => {
        const exists = state.tasks.some((task) => task.id === id);
        if (!exists) {
          return {
            tasks: [...state.tasks, response.data.data],
            isLoadingTasks: false,
          };
        }
        return { isLoadingTasks: false };
      });
    } catch (error) {
      console.error("Error fetching task details:", error);
      set({
        isLoadingTasks: false,
        error: "Failed to load task details. Please try again.",
      });
    }
  },

  createTask: async (taskData) => {
    set({ isLoadingTasks: true, error: null });
    try {
      // Asumiendo que projectsService tiene un método createTask
      const response = await projectsService.createTask(taskData);
      set((state) => ({
        tasks: [...state.tasks, response.data.data],
        isLoadingTasks: false,
      }));
    } catch (error) {
      console.error("Error creating task:", error);
      set({
        isLoadingTasks: false,
        error: "Failed to create task. Please try again.",
      });
    }
  },

  updateTask: async (id, taskData) => {
    set({ isLoadingTasks: true, error: null });
    try {
      // Asumiendo que projectsService tiene un método updateTask
      const response = await projectsService.updateTask(id, taskData);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? response.data.data : task
        ),
        isLoadingTasks: false,
      }));
    } catch (error) {
      console.error("Error updating task:", error);
      set({
        isLoadingTasks: false,
        error: "Failed to update task. Please try again.",
      });
    }
  },

  deleteTask: async (id) => {
    set({ isLoadingTasks: true, error: null });
    try {
      // Asumiendo que projectsService tiene un método deleteTask
      await projectsService.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        activeTask: state.activeTask?.id === id ? null : state.activeTask,
        isLoadingTasks: false,
      }));
    } catch (error) {
      console.error("Error deleting task:", error);
      set({
        isLoadingTasks: false,
        error: "Failed to delete task. Please try again.",
      });
    }
  },
}));