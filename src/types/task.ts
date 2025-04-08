export interface Task {
  _id: string;
  title: string;
  description: string;
  projectId: string;
  status:
    | "No Iniciado"
    | "En Progreso"
    | "Completado"
    | "Atrasado"
    | "Cancelado";
  priority: "Baja" | "Media" | "Alta";
  dueDate: string;
  assignees: {
    id: string;
    name: string;
    avatar: string;
  }[];
  tags: string[];
  createdAt: string;
  responsibleId: string;
}

export interface Project {
  _id?: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  organizationId: string;
  ownerId: string;
  status: string;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Column {
  id: Task["status"];
  title: string;
  color: string;
  description: string;
}
