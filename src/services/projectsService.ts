import { apiService } from "../config/apiConfig";
import type { Task } from "../types/task";
import { AxiosResponse } from "axios";

// Importar el tipo Project desde taskStore para mantener consistencia
import { Project } from "../store/taskStore";

// Interfaces para respuestas de la API
interface ProjectListResponse {
  data: Project[];
  totalCount: number;
  page: number;
  limit: number;
}

interface TaskListResponse {
  data: Task[];
  totalCount: number;
  page: number;
  limit: number;
}

// Tipo para crear un proyecto (sin ID)
type CreateProjectData = Omit<Project, "_id">;

// Tipo para actualizar un proyecto (todos los campos opcionales excepto los que quieras forzar)
type UpdateProjectData = Partial<Omit<Project, "_id">>;

// Tipos para tareas
type CreateTaskData = Omit<Task, "id" | "createdAt">;
type UpdateTaskData = Partial<Omit<Task, "id">>;

const getProjects = async (page: number, limit: number): Promise<any> => {
  try {
    const response = await apiService.get<ProjectListResponse>(
      `/projects?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

const getProjectById = async (id: string): Promise<any> => {
  try {
    const response = await apiService.get<{ data: Project }>(`/projects/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw error;
  }
};

const createProject = async (projectData: CreateProjectData): Promise<any> => {
  try {
    const response = await apiService.post<{ data: Project }>(
      "/projects",
      projectData
    );
    return response;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

const updateProject = async (
  id: string,
  projectData: UpdateProjectData
): Promise<any> => {
  try {
    const response = await apiService.put<{ data: Project }>(
      `/projects/${id}`,
      projectData
    );
    return response;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

const deleteProject = async (id: string): Promise<any> => {
  try {
    const response = await apiService.delete<{ success: boolean }>(
      `/projects/${id}`
    );
    return response;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

// Métodos para tareas
const getTasks = async (projectId?: string): Promise<any> => {
  try {
    const url = projectId ? `/tasks?projectId=${projectId}` : "/tasks";
    const response = await apiService.get<TaskListResponse>(url);
    return response;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

const getTaskById = async (
  id: string
): Promise<AxiosResponse<{ data: Task }>> => {
  try {
    const response = await apiService.get<{ data: Task }>(`/tasks/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching task details:", error);
    throw error;
  }
};

const createTask = async (taskData: CreateTaskData): Promise<any> => {
  try {
    const response = await apiService.post<{ data: Task }>("/tasks", taskData);
    return response;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

const updateTask = async (
  id: string,
  taskData: UpdateTaskData
): Promise<any> => {
  try {
    const response = await apiService.put<{ data: Task }>(
      `/tasks/${id}`,
      taskData
    );
    return response;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

const deleteTask = async (id: string): Promise<any> => {
  try {
    const response = await apiService.delete<{ success: boolean }>(
      `/tasks/${id}`
    );
    return response;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

const projectsService = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};

export default projectsService;
