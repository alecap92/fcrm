import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Plus, Play, Pause, Edit, MoreHorizontal, Trash } from "lucide-react";
import N8nSettings from "../../../components/settings/N8nSettings";
import { Modal } from "../../../components/ui/modal";
import { useEffect, useState } from "react";
import n8nService, { N8nAutomation } from "../../../services/n8nService";

const N8n = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [automations, setAutomations] = useState<N8nAutomation[]>([]);

  const fetchAutomations = async () => {
    const automations = await n8nService.getN8nAutomations();
    setAutomations(automations.data);
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Automatizaciones N8n
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus flujos de automatización y workflows
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Crear automatización
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {automations.map((automation) => (
                <tr
                  key={automation._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {" "}
                    {automation.name}{" "}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(automation.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {automation.endpoint}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {automation.method}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nueva Automatización N8n"
        modalSize="XL"
      >
        <N8nSettings />
      </Modal>
    </div>
  );
};

export default N8n;
