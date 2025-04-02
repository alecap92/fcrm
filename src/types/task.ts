export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignees: {
    id: string;
    name: string;
    avatar: string;
  }[];
  tags: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  isExpanded: boolean;
}

export interface Column {
  id: Task['status'];
  title: string;
  color: string;
}