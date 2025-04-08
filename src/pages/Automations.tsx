import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Zap,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Link, useLocation } from "react-router-dom";
import { automationService } from "../services/automationService";
import { useToast } from "../components/ui/toast";

const automationTabs = [
  { id: "sequences", label: "Secuencias", href: "/automations/sequences" },
  { id: "automations", label: "Mis Automatizaciones", href: "/automations" },
  { id: "templates", label: "Plantillas", href: "/automations/templates" },
];

interface Automation {
  _id: string;
  name: string;
  isActive: boolean;
  nodes: [
    {
      id: string;
      type: string;
      module: string;
      event: string;
      payloadMatch: {
        fromStatus: string;
        toStatus: string;
      };
      next: string;
    }
  ];
  organizationId: string;
  createdBy: string;
  updatedAt: string;
  createdAt: string;
}

const dummyAutomations: Automation[] = [
  {
    _id: "67e2fc3f32c74eac4c161517",
    name: "Negocio ganado - condicional + correo",
    isActive: true,
    nodes: [
      {
        id: "1",
        type: "trigger",
        module: "deals",
        event: "status_changed",
        payloadMatch: {
          fromStatus: "66c6370ad573dacc51e620f4",
          toStatus: "66c6370ad573dacc51e620f5",
        },
        next: "2",
      },
    ],
    organizationId: "659d89b73c6aa865f1e7d6fb",
    createdBy: "6594a74983de58ca5547b945",
    updatedAt: "2025-03-25T22:42:16.646Z",
    createdAt: "2025-03-25T00:00:00.000Z",
  },
];

export function Automations() {
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");

  const [automationsList, setAutomationsList] = useState(dummyAutomations);

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    workflowId: string;
    workflowName: string;
  }>({
    isOpen: false,
    workflowId: "",
    workflowName: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const toast = useToast();

  const handleToggleActive = (automationId: string) => {
    setAutomationsList((currentAutomations) =>
      currentAutomations.map((automation) =>
        automation._id === automationId
          ? {
              ...automation,
              isActive: !automation.isActive,
              status: !automation.isActive ? "success" : "inactive",
            }
          : automation
      )
    );
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    setAutomationsList((currentAutomations) =>
      currentAutomations.filter((automation) => automation._id !== workflowId)
    );
  };

  const filteredAutomations = automationsList.filter((automation) =>
    automation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchAutomations = async () => {
    try {
      const response = await automationService.getAutomations();
      setAutomationsList(response);
    } catch (error) {
      console.error("Error fetching automations:", error);
    }
  };

  const handleDelete = async (workflowId: string) => {
    try {
      const response = await automationService.deleteAutomation(workflowId);

      if (response) {
        setAutomationsList((currentAutomations) =>
          currentAutomations.filter(
            (automation) => automation._id !== workflowId
          )
        );
      }

      toast.show({
        title: "Workflow deleted",
        description: "Workflow deleted successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting workflow:", error);
      toast.show({
        title: "Error deleting workflow",
        description: "An error occurred while deleting the workflow",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Automatizaciones
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona tus flujos de trabajo automatizados
              </p>
            </div>
            <Link to="/workflow/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Automatización
              </Button>
            </Link>
          </div>

          <div className="mt-6 border-b">
            <nav className="-mb-px flex space-x-8">
              {automationTabs.map((tab) => {
                const isActive = location.pathname === tab.href;
                return (
                  <Link
                    key={tab.id}
                    to={tab.href}
                    className={`
                      whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                      ${
                        isActive
                          ? "border-action text-action"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }
                    `}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar automatizaciones..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select className="rounded-lg border-gray-300">
                  <option>Todos los disparadores</option>
                  <option>WhatsApp</option>
                  <option>Email</option>
                  <option>Webhook</option>
                  <option>Programado</option>
                </select>
                <select className="rounded-lg border-gray-300">
                  <option>Todos los estados</option>
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
                <select className="rounded-lg border-gray-300">
                  <option>Todas las fechas</option>
                  <option>Hoy</option>
                  <option>Esta semana</option>
                  <option>Este mes</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Automatización
                  </th>

                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>

                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAutomations.map((automation) => (
                  <tr key={automation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-action/10">
                          <Zap className="w-5 h-5 text-action" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {automation.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Switch
                        checked={automation.isActive}
                        onCheckedChange={() =>
                          handleToggleActive(automation._id)
                        }
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(automation._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Delete Workflow</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteDialog.workflowName}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteDialog({
                    isOpen: false,
                    workflowId: "",
                    workflowName: "",
                  })
                }
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteWorkflow(deleteDialog.workflowId);
                  setDeleteDialog({
                    isOpen: false,
                    workflowId: "",
                    workflowName: "",
                  });
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
