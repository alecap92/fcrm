import { create } from 'zustand';
import type { Task, Project, Column } from '../types/task';

interface TaskState {
  tasks: Task[];
  projects: Project[];
  columns: Column[];
  selectedProject: string | null;
  activeTask: Task | null;
  setTasks: (tasks: Task[]) => void;
  moveTask: (taskId: string, newStatus: Task['status']) => void;
  setActiveTask: (task: Task | null) => void;
  setSelectedProject: (projectId: string | null) => void;
  toggleProjectExpanded: (projectId: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [
    {
      id: '1',
      title: 'Design Homepage',
      description: 'Create new homepage design with updated branding',
      projectId: '1',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2024-03-25',
      assignees: [
        {
          id: '1',
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        }
      ],
      tags: ['design', 'frontend'],
      createdAt: '2024-03-15',
    },
    {
      id: '2',
      title: 'Implement Authentication',
      description: 'Set up user authentication system',
      projectId: '2',
      status: 'todo',
      priority: 'medium',
      dueDate: '2024-03-28',
      assignees: [
        {
          id: '2',
          name: 'Jane Smith',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        }
      ],
      tags: ['backend', 'security'],
      createdAt: '2024-03-16',
    },
  ],

  projects: [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website',
      color: '#3B82F6',
      isExpanded: true,
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'New mobile application for customers',
      color: '#10B981',
      isExpanded: true,
    },
    {
      id: '3',
      name: 'Marketing Campaign',
      description: 'Q2 2024 marketing initiatives',
      color: '#EC4899',
      isExpanded: true,
    },
  ],

  columns: [
    { id: 'backlog', title: 'Backlog', color: '#6B7280', description: 'Ideas and tasks to be planned' },
    { id: 'todo', title: 'To Do', color: '#3B82F6', description: 'Tasks ready to be worked on' },
    { id: 'in_progress', title: 'In Progress', color: '#10B981', description: 'Tasks currently being worked on' },
    { id: 'review', title: 'Review', color: '#F59E0B', description: 'Tasks ready for review' },
    { id: 'done', title: 'Done', color: '#6366F1', description: 'Completed tasks' },
  ],

  selectedProject: null,
  activeTask: null,

  setTasks: (tasks) => set({ tasks }),

  moveTask: (taskId, newStatus) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ),
  })),

  setActiveTask: (task) => set({ activeTask: task }),

  setSelectedProject: (projectId) => set({ selectedProject: projectId }),

  toggleProjectExpanded: (projectId) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === projectId
        ? { ...project, isExpanded: !project.isExpanded }
        : project
    ),
  })),
}));