import { useState } from "react";
import { Search, Filter, LayoutGrid, List, Plus } from "lucide-react";
import { Button } from "../ui/button";

interface ProjectHeaderProps {
  viewMode: "board" | "list";
  setViewMode: (mode: "board" | "list") => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddTask: () => void;
}

export function ProjectHeader({
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  searchTerm,
  setSearchTerm,
  onAddTask,
}: ProjectHeaderProps) {
  return (
    <div className="bg-white border-b">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Projects and Tasks
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your projects and tasks in one place
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 rounded-lg p-1 flex items-center">
              <button
                className={`p-1.5 rounded ${
                  viewMode === "board"
                    ? "bg-white shadow"
                    : "hover:bg-white/50"
                }`}
                onClick={() => setViewMode("board")}
                title="Board View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                className={`p-1.5 rounded ${
                  viewMode === "list"
                    ? "bg-white shadow"
                    : "hover:bg-white/50"
                }`}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button onClick={onAddTask}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-2 p-4 bg-white rounded-lg border">
            <select className="text-sm rounded-md border-gray-300">
              <option>All priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="text-sm rounded-md border-gray-300">
              <option>All tags</option>
              <option>Frontend</option>
              <option>Backend</option>
              <option>Design</option>
            </select>
            <select className="text-sm rounded-md border-gray-300">
              <option>All assignees</option>
              <option>Unassigned</option>
              <option>Assigned to me</option>
            </select>
            <select className="text-sm rounded-md border-gray-300">
              <option>Due date</option>
              <option>Today</option>
              <option>This week</option>
              <option>This month</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}