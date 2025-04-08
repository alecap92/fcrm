import { useState } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import type { Project } from "../../types/task";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, "_id">) => void;
}

export function AddProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: AddProjectModalProps) {
  const [newProject, setNewProject] = useState<
    Omit<Project, "id" | "isExpanded">
  >({
    name: "",
    description: "",
    color: "#3B82F6",
    startDate: new Date(),
    endDate: new Date(),
    budget: 0,
    organizationId: "",
    ownerId: "",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newProject);
    setNewProject({
      name: "",
      description: "",
      color: "#3B82F6",
      startDate: new Date(),
      endDate: new Date(),
      budget: 0,
      organizationId: "",
      ownerId: "",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project Name
            </label>
            <input
              type="text"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              placeholder="Enter project name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              placeholder="Enter project description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={newProject.color}
                onChange={(e) =>
                  setNewProject({ ...newProject, color: e.target.value })
                }
                className="h-8 w-8 rounded border-gray-300"
              />
              <span className="text-sm text-gray-500">{newProject.color}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Project</Button>
        </div>
      </form>
    </Modal>
  );
}
