import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Search,
  Filter,
  MoreHorizontal,
  Bot,
  Zap,
  Settings,
  BarChart3,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { useToast } from "../../../components/ui/toast";
import { AutomationForm } from "./AutomationForm";

interface Automation {
  _id: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  tags: string[];
  webhooks: Array<{
    name: string;
    endpoint: string;
    isActive: boolean;
  }>;
  executionStats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    lastExecutedAt?: string;
    avgExecutionTime?: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface AutomationsListProps {
  onAutomationCreated: () => void;
  onAutomationUpdated: () => void;
  onAutomationDeleted: () => void;
}

export function AutomationsList({
  onAutomationCreated,
  onAutomationUpdated,
  onAutomationDeleted,
}: AutomationsListProps) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const toast = useToast();

  // Cargar automatizaciones
  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    try {
      setIsLoading(true);
      // TODO: Implementar llamada a la API
      // const response = await n8nService.getAutomations({
      //   search: searchTerm,
      //   category: categoryFilter !== "all" ? categoryFilter : undefined,
      //   status: statusFilter !== "all" ? statusFilter : undefined
      // });
      // setAutomations(response.data.data);

      // Datos de ejemplo por ahora
      setAutomations([
        {
          _id: "1",
          name: "Crear Contacto",
          description:
            "Crear automáticamente un contacto cuando se recibe un mensaje de WhatsApp",
          category: "whatsapp",
          isActive: true,
          tags: ["contacto", "whatsapp", "automático"],
          webhooks: [
            {
              name: "Webhook Principal",
              endpoint: "https://n8n.example.com/webhook/create-contact",
              isActive: true,
            },
          ],
          executionStats: {
            totalExecutions: 45,
            successfulExecutions: 42,
            failedExecutions: 3,
            lastExecutedAt: "2024-01-15T10:30:00Z",
            avgExecutionTime: 1200,
          },
          createdAt: "2024-01-10T08:00:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
        },
        {
          _id: "2",
          name: "Seguimiento de Lead",
          description:
            "Enviar recordatorios automáticos para seguimiento de leads",
          category: "crm",
          isActive: true,
          tags: ["lead", "seguimiento", "recordatorio"],
          webhooks: [
            {
              name: "Email Reminder",
              endpoint: "https://n8n.example.com/webhook/email-reminder",
              isActive: true,
            },
          ],
          executionStats: {
            totalExecutions: 23,
            successfulExecutions: 23,
            failedExecutions: 0,
            lastExecutedAt: "2024-01-14T15:45:00Z",
            avgExecutionTime: 800,
          },
          createdAt: "2024-01-08T12:00:00Z",
          updatedAt: "2024-01-14T15:45:00Z",
        },
      ]);
    } catch (error) {
      console.error("Error cargando automatizaciones:", error);
      toast.show({
        title: "Error",
        description: "No se pudieron cargar las automatizaciones",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (automationId: string) => {
    try {
      // TODO: Implementar llamada a la API
      // await n8nService.toggleAutomationStatus(automationId);

      // Actualizar estado local
      setAutomations((prev) =>
        prev.map((automation) =>
          automation._id === automationId
            ? { ...automation, isActive: !automation.isActive }
            : automation
        )
      );

      toast.show({
        title: "Éxito",
        description: "Estado de automatización actualizado",
        type: "success",
      });
    } catch (error) {
      console.error("Error cambiando estado:", error);
      toast.show({
        title: "Error",
        description: "No se pudo cambiar el estado",
        type: "error",
      });
    }
  };

  const handleDelete = async (automationId: string) => {
    try {
      // TODO: Implementar llamada a la API
      // await n8nService.deleteAutomation(automationId);

      // Actualizar estado local
      setAutomations((prev) =>
        prev.filter((automation) => automation._id !== automationId)
      );
      setDeleteConfirm(null);

      onAutomationDeleted();
      toast.show({
        title: "Éxito",
        description: "Automatización eliminada",
        type: "success",
      });
    } catch (error) {
      console.error("Error eliminando automatización:", error);
      toast.show({
        title: "Error",
        description: "No se pudo eliminar la automatización",
        type: "error",
      });
    }
  };

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation);
  };

  const handleFormSubmit = () => {
    setShowCreateForm(false);
    setEditingAutomation(null);
    onAutomationCreated();
  };

  const handleFormUpdate = () => {
    setEditingAutomation(null);
    onAutomationUpdated();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "whatsapp":
        return <Bot className="w-4 h-4" />;
      case "crm":
        return <BarChart3 className="w-4 h-4" />;
      case "email":
        return <Zap className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "whatsapp":
        return "bg-green-100 text-green-800";
      case "crm":
        return "bg-blue-100 text-blue-800";
      case "email":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAutomations = automations.filter((automation) => {
    const matchesSearch =
      automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      automation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || automation.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && automation.isActive) ||
      (statusFilter === "inactive" && !automation.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Cargando automatizaciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Automatizaciones
          </h2>
          <p className="text-gray-600">
            Gestiona tus flujos de trabajo automatizados
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Automatización
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar automatizaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="crm">CRM</option>
              <option value="email">Email</option>
              <option value="custom">Personalizada</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Automatizaciones */}
      <div className="grid gap-6">
        {filteredAutomations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay automatizaciones
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ||
                  categoryFilter !== "all" ||
                  statusFilter !== "all"
                    ? "No se encontraron automatizaciones con los filtros aplicados"
                    : "Crea tu primera automatización para comenzar a automatizar tareas"}
                </p>
                {!searchTerm &&
                  categoryFilter === "all" &&
                  statusFilter === "all" && (
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Automatización
                    </Button>
                  )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAutomations.map((automation) => (
            <Card
              key={automation._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {automation.name}
                      </h3>
                      <Badge className={getCategoryColor(automation.category)}>
                        <span className="flex items-center gap-1">
                          {getCategoryIcon(automation.category)}
                          {automation.category}
                        </span>
                      </Badge>
                      <Badge
                        variant={automation.isActive ? "default" : "secondary"}
                      >
                        {automation.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>

                    {automation.description && (
                      <p className="text-gray-600 mb-3">
                        {automation.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>Webhooks: {automation.webhooks.length}</span>
                      <span>
                        Ejecuciones: {automation.executionStats.totalExecutions}
                      </span>
                      <span>
                        Éxito: {automation.executionStats.successfulExecutions}
                      </span>
                      {automation.executionStats.lastExecutedAt && (
                        <span>
                          Última:{" "}
                          {new Date(
                            automation.executionStats.lastExecutedAt
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {automation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {automation.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={automation.isActive ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleStatus(automation._id)}
                    >
                      {automation.isActive ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(automation)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirm(automation._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Crear/Editar */}
      {showCreateForm && (
        <AutomationForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {editingAutomation && (
        <AutomationForm
          isOpen={true}
          onClose={() => setEditingAutomation(null)}
          onSubmit={handleFormUpdate}
          automation={editingAutomation}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar esta automatización? Esta
              acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
