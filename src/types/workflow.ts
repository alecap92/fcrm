import { Node, Edge } from 'reactflow';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
  runsCount: number;
  status: 'success' | 'warning' | 'error' | 'inactive';
  organizationId: string;
}

export interface WorkflowCreate {
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
}

export interface WorkflowUpdate extends Partial<WorkflowCreate> {
  id: string;
  isActive?: boolean;
}

export interface WorkflowFilters {
  status?: Workflow['status'];
  isActive?: boolean;
  search?: string;
}