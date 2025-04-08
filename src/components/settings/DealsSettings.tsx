import { useEffect, useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  CircleDot,
} from "lucide-react";
import { Button } from "../ui/button";
import { useSettingsStore } from "../../store/settingsStore";
import type {
  Pipeline,
  PipelineColumn,
  DealCustomField,
} from "../../types/settings";
import { dealsService } from "../../services/dealsService";

export function DealsSettings() {
  const { dealsConfig, updateDealsConfig } = useSettingsStore();
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [editingColumn, setEditingColumn] = useState<PipelineColumn | null>(
    null
  );
  const [editingField, setEditingField] = useState<DealCustomField | null>(
    null
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [pipelines, setPipelines] = useState([
    {
      organizationId: "",
      title: "",
      _id: "",
      createdAt: "",
      updatedAt: "",
    },
  ]);
  const [statuses, setStatuses] = useState([
    {
      _id: "",
      createdAt: "",
      updatedAt: "",
      name: "",
      order: 2,
      organizationId: "",
      pipeline: "66c6370ad573dacc51e620f0",
      color: "#6B7280",
    },
  ]);
  const [dealsFields, setDealsFields] = useState([
    {
      _id: "",
      createdAt: "",
      updatedAt: "",
      key: "",
      name: "",
      options: [],
      pipeline: "66c6370ad573dacc51e620f0",
      required: false,
      type: "text",
    },
  ]);

  const handleSave = () => {
    // Save deals settings logic here
    setHasChanges(false);
  };

  const handleAddPipeline = () => {
    const newPipeline: Pipeline = {
      id: `pipeline_${Date.now()}`,
      name: "New Pipeline",
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingPipeline(newPipeline);
  };

  const handleAddColumn = (pipelineId: string) => {
    const newColumn: PipelineColumn = {
      id: `column_${Date.now()}`,
      name: "New Column",
      color: "#6B7280",
      position: dealsConfig.columns.filter((c) => c.pipelineId === pipelineId)
        .length,
      pipelineId,
    };
    setEditingColumn(newColumn);
  };

  const handleAddCustomField = () => {
    const newField: DealCustomField = {
      id: `field_${Date.now()}`,
      key: "",
      name: "",
      type: "text",
      required: false,
    };
    setEditingField(newField);
  };

  const loadDealsConfig = async () => {
    const response = await dealsService.getPipelines();

    const response2 = await dealsService.getStatuses(
      "66c6370ad573dacc51e620f0"
    );

    const response3 = await dealsService.getDealsFields(
      "66c6370ad573dacc51e620f0"
    );

    setDealsFields(response3.data);

    setStatuses(response2.data);

    setPipelines(response.data);
  };

  useEffect(() => {
    loadDealsConfig();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Configuración de Negocios
      </h2>

      <div className="space-y-6">
        {/* Pipelines */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Pipelines</h3>
            <Button onClick={handleAddPipeline}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Pipeline
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Por Defecto
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pipelines?.map((pipeline) => (
                  <tr key={pipeline._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {pipeline.title}
                      </div>
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
        </div>

        {/* Columns */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Columnas</h3>
            <Button
              onClick={() => handleAddColumn(dealsConfig?.pipelines[0]?.id)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Columna
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="w-8"></th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pipeline
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posición
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statuses.map((column) => (
                  <tr key={column._id}>
                    <td className="pl-4">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {column.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-6 h-6 rounded-full mr-2"
                          style={{ backgroundColor: column.color }}
                        />
                        <span className="text-sm text-gray-500">
                          {column.color}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {column.pipeline}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={column.order === 0}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-gray-500">
                          {column.order + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={
                            column.order === dealsConfig.columns.length - 1
                          }
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          // onClick={() => setEditingColumn(column)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
        </div>

        {/* Custom Fields */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">
              Campos Personalizados
            </h3>
            <Button onClick={handleAddCustomField}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Campo
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clave
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requerido
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dealsFields.map((field) => (
                  <tr key={field._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {field.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{field.key}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{field.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          field.required
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {field.required ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          // onClick={() => setEditingField(field)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Pipeline Edit Modal */}
      {editingPipeline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingPipeline.id ? "Editar Pipeline" : "Nuevo Pipeline"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editingPipeline.name}
                  onChange={(e) =>
                    setEditingPipeline({
                      ...editingPipeline,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={editingPipeline.description || ""}
                  onChange={(e) =>
                    setEditingPipeline({
                      ...editingPipeline,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingPipeline.isDefault}
                  onChange={(e) =>
                    setEditingPipeline({
                      ...editingPipeline,
                      isDefault: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-action focus:ring-action border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Pipeline por defecto
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEditingPipeline(null)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button>
                <Check className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Column Edit Modal */}
      {editingColumn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingColumn.id ? "Editar Columna" : "Nueva Columna"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editingColumn.name}
                  onChange={(e) =>
                    setEditingColumn({
                      ...editingColumn,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <input
                  type="color"
                  value={editingColumn.color}
                  onChange={(e) =>
                    setEditingColumn({
                      ...editingColumn,
                      color: e.target.value,
                    })
                  }
                  className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pipeline
                </label>
                <select
                  value={editingColumn.pipelineId}
                  onChange={(e) =>
                    setEditingColumn({
                      ...editingColumn,
                      pipelineId: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                >
                  {dealsConfig?.pipelines.map((pipeline) => (
                    <option key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingColumn(null)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button>
                <Check className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Field Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingField.id ? "Editar Campo" : "Nuevo Campo"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editingField.name}
                  onChange={(e) =>
                    setEditingField({
                      ...editingField,
                      name: e.target.value,
                      key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={editingField.type}
                  onChange={(e) =>
                    setEditingField({
                      ...editingField,
                      type: e.target.value as DealCustomField["type"],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                >
                  <option value="text">Texto</option>
                  <option value="number">Número</option>
                  <option value="date">Fecha</option>
                  <option value="select">Selección</option>
                  <option value="checkbox">Casilla</option>
                </select>
              </div>
              {editingField.type === "select" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Opciones
                  </label>
                  <div className="mt-1 space-y-2">
                    {editingField.options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [
                              ...(editingField.options || []),
                            ];
                            newOptions[index] = e.target.value;
                            setEditingField({
                              ...editingField,
                              options: newOptions,
                            });
                          }}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            const newOptions = [
                              ...(editingField.options || []),
                            ];
                            newOptions.splice(index, 1);
                            setEditingField({
                              ...editingField,
                              options: newOptions,
                            });
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEditingField({
                          ...editingField,
                          options: [...(editingField.options || []), ""],
                        })
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Opción
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingField.required}
                  onChange={(e) =>
                    setEditingField({
                      ...editingField,
                      required: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-action focus:ring-action border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Campo requerido
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingField(null)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button>
                <Check className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
