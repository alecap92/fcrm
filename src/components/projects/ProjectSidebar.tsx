import { Plus, Settings, Star } from "lucide-react";
import { Button } from "../ui/button";
import type { Project } from "../../types/task";

interface ProjectSidebarProps {
  projects: Project[];
  selectedProject: string | null;
  setSelectedProject: (projectId: string | null) => void;
  onAddProject: () => void;
}

export function ProjectSidebar({
  projects,
  selectedProject,
  setSelectedProject,
  onAddProject,
}: ProjectSidebarProps) {
  return (
    <div className="w-64 border-r bg-white flex-shrink-0">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">Projects</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" title="Settings">
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="New Project"
              onClick={onAddProject}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="p-2">
        <button className="w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-gray-50 mb-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-gray-900">Favorites</span>
        </button>
        {console.log(projects) as any}
        {projects?.map((project) => (
          <div key={project._id} className="mb-1">
            <button
              className={`
                w-full flex items-center gap-2 p-2 rounded-lg text-left
                ${
                  selectedProject === project._id
                    ? "bg-action/10 text-action"
                    : "hover:bg-gray-50"
                }
              `}
              onClick={() =>
                setSelectedProject(
                  selectedProject === project._id ? null : (project._id as any)
                )
              }
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span className="flex-1 text-sm font-medium truncate">
                {project.name}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
