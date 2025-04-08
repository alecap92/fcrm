import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Tag as TagIcon } from "lucide-react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import type { Task, Project, Column } from "../../types/task";
import { useAuth } from "../../contexts/AuthContext";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, "id" | "createdAt">) => void;
  projects: Project[];
  columns: Column[];
  initialStatus?: string;
  selectedProject?: string | null;
}

export function AddTaskModal({
  isOpen,
  onClose,
  onSubmit,
  projects,
  columns,
  initialStatus = "En Progreso",
  selectedProject = null,
}: AddTaskModalProps) {
  const { organization } = useAuth();
  const [newTask, setNewTask] = useState<Omit<Task, "id" | "createdAt">>({
    title: "",
    description: "",
    projectId: selectedProject || "",
    status: initialStatus as any,
    priority: "Media",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    assignees: [],
    tags: [],
    responsibleId: "",
    _id: "",
  });

  console.log(organization);

  // Update the form when props change
  useEffect(() => {
    setNewTask((prev: any) => ({
      ...prev,
      projectId: selectedProject || prev.projectId,
      status: initialStatus || prev.status,
    }));
  }, [selectedProject, initialStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newTask);
    setNewTask({
      title: "",
      description: "",
      projectId: selectedProject || "",
      status: initialStatus as any,
      priority: "Media",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      assignees: [],
      tags: [],
      responsibleId: "",
      _id: "",
    });
  };

  const handleResponsableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEmployeeId = e.target.value;

    if (selectedEmployeeId) {
      const selectedEmployee = organization.employees.find(
        (employee) => employee._id === selectedEmployeeId
      );

      if (selectedEmployee) {
        // Create an assignee object from the selected employee
        const assignee = {
          id: selectedEmployee._id,
          name: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        };

        // Update the task with the responsibleId and add to assignees if not already there
        setNewTask({
          ...newTask,
          responsibleId: selectedEmployeeId,
          assignees: newTask.assignees.some((a) => a.id === selectedEmployeeId)
            ? newTask.assignees
            : [...newTask.assignees, assignee],
        });
      }
    } else {
      // If no employee selected, clear the responsibleId
      setNewTask({
        ...newTask,
        responsibleId: "",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Task Title
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project
              </label>
              <select
                value={newTask.projectId}
                onChange={(e) =>
                  setNewTask({ ...newTask, projectId: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                required
              >
                <option value="">Select a project</option>
                {projects?.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={newTask.status}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    status: e.target.value as Task["status"],
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              >
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    priority: e.target.value as Task["priority"],
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Responsable <span className="text-red-500">*</span>
            </label>
            <select
              value={newTask.responsibleId}
              onChange={handleResponsableChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              required
            >
              <option value="">Select a responsable</option>
              {organization?.employees?.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.firstName} {employee.lastName} ({employee.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Add tag and press Enter"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value) {
                    e.preventDefault();
                    setNewTask({
                      ...newTask,
                      tags: [...newTask.tags, e.currentTarget.value],
                    });
                    e.currentTarget.value = "";
                  }
                }}
              />
              {newTask.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md"
                >
                  <TagIcon className="w-3 h-3" />
                  <span className="text-sm">{tag}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTask({
                        ...newTask,
                        tags: newTask.tags.filter((_, i) => i !== index),
                      });
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Task</Button>
        </div>
      </form>
    </Modal>
  );
}
