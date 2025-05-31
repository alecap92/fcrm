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
  Settings,
} from "lucide-react";
import { Button } from "../ui/button";
import { useSettingsStore } from "../../store/settingsStore";
import type {
  Pipeline,
  PipelineColumn,
  DealCustomField,
} from "../../types/settings";
import { dealsService } from "../../services/dealsService";

// Interfaces para los datos del API
interface APIPipeline {
  _id: string;
  title: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

interface APIStatus {
  _id: string;
  name: string;
  color: string;
  order: number;
  pipeline: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

interface APIField {
  _id: string;
  name: string;
  key: string;
  type: string;
  required: boolean;
  options: string[];
  pipeline: string;
  createdAt: string;
  updatedAt: string;
}

interface ExtendedPipeline extends Pipeline {
  columns: PipelineColumn[];
  customFields: DealCustomField[];
  originalColumns?: PipelineColumn[]; // Para rastrear columnas originales
  originalFields?: DealCustomField[]; // Para rastrear campos originales
}

export function DealsSettings() {
  const { updateDealsConfig } = useSettingsStore();
  const [editingPipeline, setEditingPipeline] =
    useState<ExtendedPipeline | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pipelines, setPipelines] = useState<APIPipeline[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const handleSave = async () => {
    try {
      setLoading(true);
      setHasChanges(false);
      console.log("Configuración guardada");
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPipeline = () => {
    const newPipeline: ExtendedPipeline = {
      id: `pipeline_${Date.now()}`,
      name: "Nuevo Pipeline",
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      columns: [
        {
          id: `column_${Date.now()}_1`,
          name: "Nuevo",
          color: "#6B7280",
          position: 0,
          pipelineId: `pipeline_${Date.now()}`,
        },
        {
          id: `column_${Date.now()}_2`,
          name: "En Progreso",
          color: "#3B82F6",
          position: 1,
          pipelineId: `pipeline_${Date.now()}`,
        },
        {
          id: `column_${Date.now()}_3`,
          name: "Cerrado",
          color: "#10B981",
          position: 2,
          pipelineId: `pipeline_${Date.now()}`,
        },
      ],
      customFields: [],
      originalColumns: [],
      originalFields: [],
    };
    setEditingPipeline(newPipeline);
  };

  const handleEditPipeline = async (pipeline: APIPipeline) => {
    try {
      setLoading(true);

      // Cargar columnas y campos del pipeline
      const [statusesResponse, fieldsResponse] = await Promise.all([
        dealsService.getStatuses(pipeline._id),
        dealsService.getDealsFields(pipeline._id),
      ]);

      const columns: PipelineColumn[] = (statusesResponse.data || [])
        .sort((a: APIStatus, b: APIStatus) => a.order - b.order)
        .map((status: APIStatus) => ({
          id: status._id,
          name: status.name,
          color: status.color,
          position: status.order,
          pipelineId: status.pipeline,
        }));

      const customFields: DealCustomField[] = (fieldsResponse.data || []).map(
        (field: APIField) => ({
          id: field._id,
          key: field.key,
          name: field.name,
          type: field.type as DealCustomField["type"],
          required: field.required,
          options: field.options,
        })
      );

      const pipelineToEdit: ExtendedPipeline = {
        id: pipeline._id,
        name: pipeline.title,
        isDefault: false,
        createdAt: pipeline.createdAt,
        updatedAt: pipeline.updatedAt,
        columns,
        customFields,
        originalColumns: JSON.parse(JSON.stringify(columns)), // Deep copy
        originalFields: JSON.parse(JSON.stringify(customFields)), // Deep copy
      };

      setEditingPipeline(pipelineToEdit);
    } catch (error) {
      console.error("Error al cargar datos del pipeline:", error);
      alert("Error al cargar los datos del pipeline");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePipeline = async () => {
    if (!editingPipeline) return;

    if (!editingPipeline.name.trim()) {
      alert("El nombre del pipeline es requerido");
      return;
    }

    if (editingPipeline.columns.length === 0) {
      alert("El pipeline debe tener al menos una columna");
      return;
    }

    try {
      setLoading(true);

      if (editingPipeline.id.startsWith("pipeline_")) {
        // Crear nuevo pipeline
        const pipelineData = {
          title: editingPipeline.name,
          states: editingPipeline.columns.map((col, index) => ({
            name: col.name,
            order: index,
            color: col.color,
          })),
        };

        const response = await dealsService.createPipeline(pipelineData);

        if (response.data) {
          // Crear campos personalizados si los hay
          const newPipelineId = response.data.pipeline._id;

          for (const field of editingPipeline.customFields) {
            if (field.name.trim()) {
              const fieldData = {
                name: field.name,
                key: field.key || field.name.toLowerCase().replace(/\s+/g, "_"),
                type: field.type,
                required: field.required,
                options: field.options || [],
                pipeline: newPipelineId,
              };
              await dealsService.createDealField(fieldData);
            }
          }

          // Recargar pipelines
          await loadPipelines();
        }
      } else {
        // Actualizar pipeline existente
        await dealsService.updatePipeline(editingPipeline.id, {
          title: editingPipeline.name,
        });

        // 1. ELIMINAR columnas que fueron removidas
        const originalColumnIds = new Set(
          editingPipeline.originalColumns?.map((col) => col.id) || []
        );
        const currentColumnIds = new Set(
          editingPipeline.columns.map((col) => col.id)
        );

        for (const originalColumnId of originalColumnIds) {
          if (!currentColumnIds.has(originalColumnId)) {
            console.log("Eliminando columna:", originalColumnId);
            try {
              await dealsService.deleteStatus(originalColumnId);
            } catch (error) {
              console.error("Error eliminando columna:", error);
              // Si hay deals asociados, mostrar mensaje específico
              if (error instanceof Error && error.message.includes("deal")) {
                alert(
                  `No se puede eliminar la columna porque tiene deals asociados. Mueve los deals a otra columna primero.`
                );
                setLoading(false);
                return;
              }
            }
          }
        }

        // 2. CREAR/ACTUALIZAR columnas
        for (const column of editingPipeline.columns) {
          if (column.id.startsWith("column_")) {
            // Crear nueva columna
            const statusData = {
              name: column.name,
              color: column.color,
              order: column.position,
              pipeline: editingPipeline.id,
            };
            await dealsService.createStatus(statusData);
          } else {
            // Actualizar columna existente
            const statusData = {
              name: column.name,
              color: column.color,
              order: column.position,
            };
            await dealsService.updateStatus(column.id, statusData);
          }
        }

        // 3. ELIMINAR campos que fueron removidos
        const originalFieldIds = new Set(
          editingPipeline.originalFields?.map((field) => field.id) || []
        );
        const currentFieldIds = new Set(
          editingPipeline.customFields.map((field) => field.id)
        );

        for (const originalFieldId of originalFieldIds) {
          if (!currentFieldIds.has(originalFieldId)) {
            console.log("Eliminando campo:", originalFieldId);
            try {
              await dealsService.deleteDealField(originalFieldId);
            } catch (error) {
              console.error("Error eliminando campo:", error);
            }
          }
        }

        // 4. CREAR/ACTUALIZAR campos personalizados
        for (const field of editingPipeline.customFields) {
          if (field.id.startsWith("field_")) {
            // Crear nuevo campo
            if (field.name.trim()) {
              const fieldData = {
                name: field.name,
                key: field.key || field.name.toLowerCase().replace(/\s+/g, "_"),
                type: field.type,
                required: field.required,
                options: field.options || [],
                pipeline: editingPipeline.id,
              };
              await dealsService.createDealField(fieldData);
            }
          } else {
            // Actualizar campo existente
            const fieldData = {
              name: field.name,
              key: field.key,
              type: field.type,
              required: field.required,
              options: field.options || [],
              pipeline: editingPipeline.id,
            };
            await dealsService.updateDealField(field.id, fieldData);
          }
        }

        // Actualizar estado local
        setPipelines((prev) =>
          prev.map((pipeline) =>
            pipeline._id === editingPipeline.id
              ? { ...pipeline, title: editingPipeline.name }
              : pipeline
          )
        );
      }

      setHasChanges(true);
      setEditingPipeline(null);

      // Mostrar mensaje de éxito
      alert("Pipeline guardado correctamente");
    } catch (error) {
      console.error("Error al guardar pipeline:", error);
      alert("Error al guardar el pipeline");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePipeline = async (pipelineId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este pipeline? Esto eliminará todos los deals, columnas y campos asociados."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await dealsService.deletePipeline(pipelineId);
      setPipelines((prev) =>
        prev.filter((pipeline) => pipeline._id !== pipelineId)
      );
      setHasChanges(true);
    } catch (error) {
      console.error("Error al eliminar pipeline:", error);
      alert("Error al eliminar el pipeline");
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar columnas dentro del modal
  const handleAddColumn = () => {
    if (!editingPipeline) return;

    const newColumn: PipelineColumn = {
      id: `column_${Date.now()}`,
      name: "Nueva Columna",
      color: "#6B7280",
      position: editingPipeline.columns.length,
      pipelineId: editingPipeline.id,
    };

    setEditingPipeline({
      ...editingPipeline,
      columns: [...editingPipeline.columns, newColumn],
    });
  };

  const handleUpdateColumn = (
    columnId: string,
    updates: Partial<PipelineColumn>
  ) => {
    if (!editingPipeline) return;

    setEditingPipeline({
      ...editingPipeline,
      columns: editingPipeline.columns.map((col) =>
        col.id === columnId ? { ...col, ...updates } : col
      ),
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    if (!editingPipeline) return;

    if (editingPipeline.columns.length <= 1) {
      alert("El pipeline debe tener al menos una columna");
      return;
    }

    setEditingPipeline({
      ...editingPipeline,
      columns: editingPipeline.columns
        .filter((col) => col.id !== columnId)
        .map((col, index) => ({ ...col, position: index })),
    });
  };

  const handleMoveColumn = (columnId: string, direction: "up" | "down") => {
    if (!editingPipeline) return;

    const columns = [...editingPipeline.columns].sort(
      (a, b) => a.position - b.position
    );
    const currentIndex = columns.findIndex((col) => col.id === columnId);

    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === columns.length - 1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Intercambiar posiciones
    [columns[currentIndex], columns[newIndex]] = [
      columns[newIndex],
      columns[currentIndex],
    ];

    // Actualizar posiciones
    const updatedColumns = columns.map((col, index) => ({
      ...col,
      position: index,
    }));

    setEditingPipeline({
      ...editingPipeline,
      columns: updatedColumns,
    });
  };

  // Funciones para manejar campos personalizados dentro del modal
  const handleAddCustomField = () => {
    if (!editingPipeline) return;

    const newField: DealCustomField = {
      id: `field_${Date.now()}`,
      key: "",
      name: "",
      type: "text",
      required: false,
    };

    setEditingPipeline({
      ...editingPipeline,
      customFields: [...editingPipeline.customFields, newField],
    });
  };

  const handleUpdateField = (
    fieldId: string,
    updates: Partial<DealCustomField>
  ) => {
    if (!editingPipeline) return;

    setEditingPipeline({
      ...editingPipeline,
      customFields: editingPipeline.customFields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    });
  };

  const handleDeleteField = (fieldId: string) => {
    if (!editingPipeline) return;

    setEditingPipeline({
      ...editingPipeline,
      customFields: editingPipeline.customFields.filter(
        (field) => field.id !== fieldId
      ),
    });
  };

  const loadPipelines = async () => {
    try {
      setInitialLoading(true);
      const pipelinesResponse = await dealsService.getPipelines();
      const pipelinesData = pipelinesResponse.data || [];
      setPipelines(pipelinesData);
    } catch (error) {
      console.error("Error al cargar pipelines:", error);
      alert("Error al cargar los pipelines");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadPipelines();
  }, []);

  // Mostrar loading mientras se cargan los datos iniciales
  if (initialLoading) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Configuración de Negocios
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Cargando configuración...</div>
        </div>
      </div>
    );
  }

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
            <Button onClick={handleAddPipeline} disabled={loading}>
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
                    Fecha de Creación
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(pipelines) &&
                  pipelines.map((pipeline) => (
                    <tr key={pipeline._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {pipeline.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(pipeline.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={loading}
                            onClick={() => handleEditPipeline(pipeline)}
                            title="Configurar pipeline"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={loading}
                            onClick={() => handleDeletePipeline(pipeline._id)}
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
          <Button onClick={handleSave} disabled={!hasChanges || loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      {/* Pipeline Edit Modal */}
      {editingPipeline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              {editingPipeline.id.startsWith("pipeline_")
                ? "Nuevo Pipeline"
                : `Configurar Pipeline: ${editingPipeline.name}`}
            </h3>

            <div className="space-y-6">
              {/* Información básica del pipeline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Información Básica
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre *
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      placeholder="Nombre del pipeline"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={editingPipeline.description || ""}
                      onChange={(e) =>
                        setEditingPipeline({
                          ...editingPipeline,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      placeholder="Descripción del pipeline"
                    />
                  </div>
                </div>
              </div>

              {/* Columnas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Columnas ({editingPipeline.columns.length})
                  </h4>
                  <Button variant="outline" size="sm" onClick={handleAddColumn}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Columna
                  </Button>
                </div>

                <div className="space-y-3">
                  {editingPipeline.columns
                    .sort((a, b) => a.position - b.position)
                    .map((column, index) => (
                      <div
                        key={column.id}
                        className="bg-white rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={index === 0}
                              onClick={() => handleMoveColumn(column.id, "up")}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={
                                index === editingPipeline.columns.length - 1
                              }
                              onClick={() =>
                                handleMoveColumn(column.id, "down")
                              }
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <input
                                type="text"
                                value={column.name}
                                onChange={(e) =>
                                  handleUpdateColumn(column.id, {
                                    name: e.target.value,
                                  })
                                }
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                placeholder="Nombre de la columna"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={column.color}
                                onChange={(e) =>
                                  handleUpdateColumn(column.id, {
                                    color: e.target.value,
                                  })
                                }
                                className="w-10 h-8 rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-500">
                                {column.color}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                Posición: {index + 1}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteColumn(column.id)}
                                disabled={editingPipeline.columns.length <= 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Campos Personalizados */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Campos Personalizados ({editingPipeline.customFields.length}
                    )
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomField}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Campo
                  </Button>
                </div>

                <div className="space-y-3">
                  {editingPipeline.customFields.map((field) => (
                    <div
                      key={field.id}
                      className="bg-white rounded-lg border p-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => {
                              const name = e.target.value;
                              const key = name
                                .toLowerCase()
                                .replace(/\s+/g, "_");
                              handleUpdateField(field.id, { name, key });
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            placeholder="Nombre del campo"
                          />
                        </div>
                        <div>
                          <select
                            value={field.type}
                            onChange={(e) =>
                              handleUpdateField(field.id, {
                                type: e.target.value as DealCustomField["type"],
                              })
                            }
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          >
                            <option value="text">Texto</option>
                            <option value="number">Número</option>
                            <option value="date">Fecha</option>
                            <option value="select">Selección</option>
                            <option value="checkbox">Casilla</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              handleUpdateField(field.id, {
                                required: e.target.checked,
                              })
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="text-sm text-gray-700">
                            Requerido
                          </label>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteField(field.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {field.type === "select" && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Opciones
                          </label>
                          <div className="space-y-2">
                            {field.options?.map((option, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [
                                      ...(field.options || []),
                                    ];
                                    newOptions[index] = e.target.value;
                                    handleUpdateField(field.id, {
                                      options: newOptions,
                                    });
                                  }}
                                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                  placeholder="Opción"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    const newOptions = [
                                      ...(field.options || []),
                                    ];
                                    newOptions.splice(index, 1);
                                    handleUpdateField(field.id, {
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
                              size="sm"
                              onClick={() => {
                                const newOptions = [
                                  ...(field.options || []),
                                  "",
                                ];
                                handleUpdateField(field.id, {
                                  options: newOptions,
                                });
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Agregar Opción
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEditingPipeline(null)}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSavePipeline} disabled={loading}>
                <Check className="w-4 h-4 mr-2" />
                {loading ? "Guardando..." : "Guardar Pipeline"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
