import { WorkflowCreate, WorkflowUpdate, WorkflowFilters, Workflow } from '../types/workflow';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(response.status, error.message);
  }
  return response.json();
}

export const api = {
  workflows: {
    list: async (filters?: WorkflowFilters): Promise<Workflow[]> => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`${API_URL}/workflows?${params}`);
      return handleResponse<Workflow[]>(response);
    },

    get: async (id: string): Promise<Workflow> => {
      const response = await fetch(`${API_URL}/workflows/${id}`);
      return handleResponse<Workflow>(response);
    },

    create: async (workflow: WorkflowCreate): Promise<Workflow> => {
      const response = await fetch(`${API_URL}/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflow),
      });
      return handleResponse<Workflow>(response);
    },

    update: async (workflow: WorkflowUpdate): Promise<Workflow> => {
      const response = await fetch(`${API_URL}/workflows/${workflow.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflow),
      });
      return handleResponse<Workflow>(response);
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/workflows/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },

    toggleActive: async (id: string, isActive: boolean): Promise<Workflow> => {
      const response = await fetch(`${API_URL}/workflows/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });
      return handleResponse<Workflow>(response);
    },

    execute: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/workflows/${id}/execute`, {
        method: 'POST',
      });
      return handleResponse<void>(response);
    },
  },
};