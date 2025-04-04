import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

import {
  Play,
  Search,
  Plus,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { automationService, Automation } from "../services/automationService";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useToast } from "../components/ui/toast";

export function AutomationsList() {
  const navigate = useNavigate();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const toast = useToast();

  useEffect(() => {
    loadAutomations();
  }, [statusFilter]);

  const loadAutomations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await automationService.getAutomations({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm || undefined,
      });

      setAutomations(response.data);
      setIsLoading(false);
    } catch (err: any) {
      setError(`Failed to load automations: ${err.message || "Unknown error"}`);
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadAutomations();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleToggleActive = async (
    id: string,
    currentStatus: "active" | "inactive"
  ) => {
    try {
      setIsLoading(true);
      await automationService.toggleAutomationActive(id);

      // Actualizar la lista localmente para evitar otra llamada a la API
      setAutomations(
        automations.map((automation) =>
          automation.id === id
            ? {
                ...automation,
                status: currentStatus === "active" ? "inactive" : "active",
              }
            : automation
        )
      );

      toast.show({
        title: "Automation updated",
        description: "Automation status updated successfully",
        type: "success",
      });

      setIsLoading(false);
    } catch (err: any) {
      setError(
        `Failed to update automation: ${err.message || "Unknown error"}`
      );
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await automationService.deleteAutomation(id);

      // Eliminar de la lista local
      setAutomations(automations.filter((automation) => automation.id !== id));

      toast.show({
        title: "Automation deleted",
        description: "Automation deleted successfully",
        type: "success",
      });
      setDeleteConfirm(null);
      setIsLoading(false);
    } catch (err: any) {
      setError(
        `Failed to delete automation: ${err.message || "Unknown error"}`
      );
      setIsLoading(false);
    }
  };

  const handleExecute = async (id: string) => {
    try {
      setIsLoading(true);
      const result = await automationService.executeAutomation(id);

      toast.show({
        title: "Automation executed",
        description: "Automation executed successfully",
        type: "success",
      });

      setIsLoading(false);
    } catch (err: any) {
      setError(
        `Failed to execute automation: ${err.message || "Unknown error"}`
      );
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy HH:mm");
    } catch {
      return dateStr;
    }
  };

  // Aplicar filtros al renderizar
  const filteredAutomations = automations.filter((automation) => {
    if (
      searchTerm &&
      !automation.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    if (statusFilter !== "all" && automation.status !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Automations</h1>
        <Button
          onClick={() => navigate("/automations/new")}
          className="bg-primary text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Automation
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[280px]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search automations..."
                className="pl-9"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
              className={statusFilter === "active" ? "bg-green-600" : ""}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("inactive")}
              className={statusFilter === "inactive" ? "bg-gray-600" : ""}
            >
              Inactive
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : filteredAutomations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No automations found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== "all"
              ? "Try changing your search criteria or filters"
              : "Get started by creating your first automation"}
          </p>
          <Button
            onClick={() => navigate("/automations/new")}
            className="bg-primary text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Automation
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAutomations.map((automation) => (
                <tr key={automation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900">
                          {automation.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {automation.description || "No description"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={
                        automation.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {automation.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDate(automation.updatedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleToggleActive(automation.id, automation.status)
                        }
                        disabled={isLoading}
                        title={
                          automation.status === "active"
                            ? "Deactivate"
                            : "Activate"
                        }
                      >
                        <p>toggle</p>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/automations/${automation.id}`)
                        }
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExecute(automation.id)}
                        disabled={isLoading || automation.status !== "active"}
                        title="Execute manually"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(automation.id)}
                        className="text-red-600 hover:text-red-800 hover:border-red-300"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation dialog for delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this automation? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
