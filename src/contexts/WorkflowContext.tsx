import React, { createContext, useContext, useCallback, useState } from 'react';
import { useToast } from '../components/ui/toast';
import { api } from '../services/api';
import { Workflow, WorkflowFilters, WorkflowCreate, WorkflowUpdate } from '../types/workflow';

interface WorkflowContextType {
  workflows: Workflow[];
  isLoading: boolean;
  error: string | null;
  loadWorkflows: (filters?: WorkflowFilters) => Promise<void>;
  getWorkflow: (id: string) => Promise<Workflow>;
  createWorkflow: (workflow: WorkflowCreate) => Promise<Workflow>;
  updateWorkflow: (workflow: WorkflowUpdate) => Promise<Workflow>;
  deleteWorkflow: (id: string) => Promise<void>;
  toggleWorkflowActive: (id: string, isActive: boolean) => Promise<void>;
  executeWorkflow: (id: string) => Promise<void>;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleError = (error: unknown) => {
    const message = error instanceof Error ? error.message : 'An error occurred';
    setError(message);
    toast.show({
      title: 'Error',
      description: message,
      type: 'error',
    });
  };

  const loadWorkflows = useCallback(async (filters?: WorkflowFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.workflows.list(filters);
      setWorkflows(data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getWorkflow = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      return await api.workflows.get(id);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createWorkflow = useCallback(async (workflow: WorkflowCreate) => {
    try {
      setIsLoading(true);
      setError(null);
      const created = await api.workflows.create(workflow);
      setWorkflows(current => [...current, created]);
      toast.show({
        title: 'Success',
        description: 'Workflow created successfully',
        type: 'success',
      });
      return created;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateWorkflow = useCallback(async (workflow: WorkflowUpdate) => {
    try {
      setIsLoading(true);
      setError(null);
      const updated = await api.workflows.update(workflow);
      setWorkflows(current =>
        current.map(w => (w.id === workflow.id ? updated : w))
      );
      toast.show({
        title: 'Success',
        description: 'Workflow updated successfully',
        type: 'success',
      });
      return updated;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteWorkflow = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.workflows.delete(id);
      setWorkflows(current => current.filter(w => w.id !== id));
      toast.show({
        title: 'Success',
        description: 'Workflow deleted successfully',
        type: 'success',
      });
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleWorkflowActive = useCallback(async (id: string, isActive: boolean) => {
    try {
      setError(null);
      const updated = await api.workflows.toggleActive(id, isActive);
      setWorkflows(current =>
        current.map(w => (w.id === id ? updated : w))
      );
      toast.show({
        title: 'Success',
        description: `Workflow ${isActive ? 'activated' : 'deactivated'} successfully`,
        type: 'success',
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, []);

  const executeWorkflow = useCallback(async (id: string) => {
    try {
      setError(null);
      await api.workflows.execute(id);
      toast.show({
        title: 'Success',
        description: 'Workflow execution started',
        type: 'success',
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, []);

  const value = {
    workflows,
    isLoading,
    error,
    loadWorkflows,
    getWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflowActive,
    executeWorkflow,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}