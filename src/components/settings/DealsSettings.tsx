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

export function DealsSettings() {
  const { updateDealsConfig } = useSettingsStore();
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [editingColumn, setEditingColumn] = useState<PipelineColumn | null>(
    null
  );
  const [editingField, setEditingField] = useState<DealCustomField | null>(
    null
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pipelines, setPipelines] = useState<APIPipeline[]>([]);
  const [statuses, setStatuses] = useState<APIStatus[]>([]);
  const [dealsFields, setDealsFields] = useState<APIField[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [dealsCount, setDealsCount] = useState<Record<string, number>>({});

  const handleSave = async () => {
    try {
      setLoading(true);
      // Aquí implementarías la lógica para guardar todos los cambios
      // Por ahora solo actualizamos el estado
      setHasChanges(false);
      console.log("Configuración guardada");
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPipeline = () => {
    const newPipeline: Pipeline = {
      id: `pipeline_${Date.now()}`,
      name: "Nuevo Pipeline",
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingPipeline(newPipeline);
  };

  const handleSavePipeline = async () => {
    if (!editingPipeline) return;

    if (!editingPipeline.name.trim()) {
      alert("El nombre del pipeline es requerido");
      return;
    }

    try {
      setLoading(true);

      if (editingPipeline.id.startsWith("pipeline_")) {
        // Crear nuevo pipeline
        const pipelineData = {
          title: editingPipeline.name,
          states: [
            { name: "Nuevo", order: 0 },
            { name: "En Progreso", order: 1 },
            { name: "Cerrado", order: 2 },
          ],
        };

        const response = await dealsService.createPipeline(pipelineData);

        if (response.data) {
          // Recargar pipelines
          await loadDealsConfig();
        }
      } else {
        // Actualizar pipeline existente
        await dealsService.updatePipeline(editingPipeline.id, {
          title: editingPipeline.name,
        });

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
    } catch (error) {
      console.error("Error al guardar pipeline:", error);
      alert("Error al guardar el pipeline");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPipeline = (pipeline: APIPipeline) => {
    const pipelineToEdit: Pipeline = {
      id: pipeline._id,
      name: pipeline.title,
      isDefault: false,
      createdAt: pipeline.createdAt,
      updatedAt: pipeline.updatedAt,
    };
    setEditingPipeline(pipelineToEdit);
  };

  const handleDeletePipeline = async (pipelineId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este pipeline? Esto eliminará todos los deals asociados."
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

      // Si era el pipeline seleccionado, limpiar selección
      if (selectedPipelineId === pipelineId) {
        setSelectedPipelineId("");
      }

      setHasChanges(true);
    } catch (error) {
      console.error("Error al eliminar pipeline:", error);
      alert("Error al eliminar el pipeline");
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = () => {
    if (!selectedPipelineId && pipelines.length === 0) {
      alert("Primero debes crear un pipeline");
      return;
    }

    const pipelineId = selectedPipelineId || pipelines[0]._id;
    const currentColumns = statuses.filter((s) => s.pipeline === pipelineId);

    // La nueva posición será el número de columnas existentes (0-indexed)
    const newPosition = currentColumns.length;

    const newColumn: PipelineColumn = {
      id: `column_${Date.now()}`,
      name: "Nueva Columna",
      color: "#6B7280",
      position: newPosition,
      pipelineId,
    };
    setEditingColumn(newColumn);
  };

  const handleEditColumn = (status: APIStatus) => {
    const column: PipelineColumn = {
      id: status._id,
      name: status.name,
      color: status.color,
      position: status.order,
      pipelineId: status.pipeline,
    };
    setEditingColumn(column);
  };

  const handleSaveColumn = async () => {
    if (!editingColumn) return;

    if (!editingColumn.name.trim()) {
      alert("El nombre de la columna es requerido");
      return;
    }

    try {
      setLoading(true);

      if (editingColumn.id.startsWith("column_")) {
        // Crear nueva columna
        const statusData = {
          name: editingColumn.name,
          color: editingColumn.color,
          order: editingColumn.position,
          pipeline: editingColumn.pipelineId,
        };

        const response = await dealsService.createStatus(statusData);

        if (response.data) {
          // Recargar statuses
          const statusesResponse = await dealsService.getStatuses(
            editingColumn.pipelineId
          );
          setStatuses(statusesResponse.data || []);

          // Refrescar conteo de deals
          await refreshDealsCount(editingColumn.pipelineId);
        }
      } else {
        // Actualizar columna existente
        const statusData = {
          name: editingColumn.name,
          color: editingColumn.color,
          order: editingColumn.position,
        };

        await dealsService.updateStatus(editingColumn.id, statusData);

        // Actualizar estado local
        setStatuses((prev) =>
          prev.map((status) =>
            status._id === editingColumn.id
              ? {
                  ...status,
                  name: editingColumn.name,
                  color: editingColumn.color,
                  order: editingColumn.position,
                }
              : status
          )
        );
      }

      setHasChanges(true);
      setEditingColumn(null);
    } catch (error) {
      console.error("Error al guardar columna:", error);
      alert("Error al guardar la columna");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColumn = async (statusId: string) => {
    const status = statuses.find((s) => s._id === statusId);
    const statusName = status?.name || "esta columna";

    try {
      setLoading(true);

      // Verificar en tiempo real con el backend
      const dealCheck = await dealsService.checkStatusHasDeals(statusId);
      const realDealCount = dealCheck.count;

      console.log(
        `Status ${statusName}: Frontend count = ${
          dealsCount[statusId] || 0
        }, Backend count = ${realDealCount}`
      );

      let confirmMessage = `¿Estás seguro de que quieres eliminar "${statusName}"?`;
      if (realDealCount > 0) {
        confirmMessage += `\n\nAdvertencia: Esta columna tiene ${realDealCount} deal(s) asociado(s). No se podrá eliminar hasta que muevas o elimines todos los deals.`;
      }

      if (!confirm(confirmMessage)) {
        setLoading(false);
        return;
      }

      // Si hay deals asociados, no intentar eliminar
      if (realDealCount > 0) {
        alert(
          `No se puede eliminar "${statusName}" porque tiene ${realDealCount} deal(s) asociado(s).\n\n` +
            `Para eliminar esta columna, primero debes:\n` +
            `1. Mover todos los deals a otra columna, o\n` +
            `2. Eliminar los deals asociados`
        );
        setLoading(false);
        return;
      }

      await dealsService.deleteStatus(statusId);
      setStatuses((prev) => prev.filter((status) => status._id !== statusId));

      // Actualizar el conteo local eliminando la entrada
      const newCounts = { ...dealsCount };
      delete newCounts[statusId];
      setDealsCount(newCounts);

      // Reordenar posiciones para que sean consecutivas
      const currentPipelineId = selectedPipelineId || pipelines[0]?._id;
      if (currentPipelineId) {
        await reorderStatusPositions(currentPipelineId);
        await refreshDealsCount(currentPipelineId);
      }

      setHasChanges(true);
      alert("Columna eliminada exitosamente");
    } catch (error: any) {
      console.error("Error al eliminar columna:", error);

      // Manejar específicamente el error de deals asociados
      if (error.message && error.message.includes("deal(s) asociado(s)")) {
        alert(
          `No se puede eliminar "${statusName}" porque tiene deals asociados.\n\n` +
            `Para eliminar esta columna, primero debes:\n` +
            `1. Mover todos los deals a otra columna, o\n` +
            `2. Eliminar los deals asociados\n\n` +
            `Detalles: ${error.message}`
        );
      } else {
        alert(
          "Error al eliminar la columna: " +
            (error.message || "Error desconocido")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMoveColumn = async (
    statusId: string,
    direction: "up" | "down"
  ) => {
    const status = statuses.find((s) => s._id === statusId);
    if (!status) return;

    const pipelineStatuses = statuses
      .filter((s) => s.pipeline === status.pipeline)
      .sort((a, b) => a.order - b.order);

    const currentIndex = pipelineStatuses.findIndex((s) => s._id === statusId);

    // Verificar límites
    if (direction === "up" && currentIndex === 0) return; // Ya está en la primera posición
    if (direction === "down" && currentIndex === pipelineStatuses.length - 1)
      return; // Ya está en la última posición

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    try {
      setLoading(true);

      const statusToMove = pipelineStatuses[currentIndex];
      const statusToSwap = pipelineStatuses[newIndex];

      // Actualizar las posiciones en el backend
      await Promise.all([
        dealsService.updateStatus(statusToMove._id, {
          name: statusToMove.name,
          color: statusToMove.color,
          order: statusToSwap.order,
        }),
        dealsService.updateStatus(statusToSwap._id, {
          name: statusToSwap.name,
          color: statusToSwap.color,
          order: statusToMove.order,
        }),
      ]);

      // Actualizar estado local
      const updatedStatuses = [...statuses];
      const statusToMoveIndex = updatedStatuses.findIndex(
        (s) => s._id === statusToMove._id
      );
      const statusToSwapIndex = updatedStatuses.findIndex(
        (s) => s._id === statusToSwap._id
      );

      updatedStatuses[statusToMoveIndex] = {
        ...statusToMove,
        order: statusToSwap.order,
      };
      updatedStatuses[statusToSwapIndex] = {
        ...statusToSwap,
        order: statusToMove.order,
      };

      setStatuses(updatedStatuses);
      setHasChanges(true);
    } catch (error) {
      console.error("Error al mover columna:", error);
      alert("Error al cambiar la posición de la columna");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomField = () => {
    if (!selectedPipelineId && pipelines.length === 0) {
      alert("Primero debes crear un pipeline");
      return;
    }

    const newField: DealCustomField = {
      id: `field_${Date.now()}`,
      key: "",
      name: "",
      type: "text",
      required: false,
    };
    setEditingField(newField);
  };

  const handleEditField = (field: APIField) => {
    const customField: DealCustomField = {
      id: field._id,
      key: field.key,
      name: field.name,
      type: field.type as DealCustomField["type"],
      required: field.required,
      options: field.options,
    };
    setEditingField(customField);
  };

  const handleSaveField = async () => {
    if (!editingField) return;

    if (!editingField.name.trim()) {
      alert("El nombre del campo es requerido");
      return;
    }

    try {
      setLoading(true);

      const pipelineId = selectedPipelineId || pipelines[0]._id;

      if (editingField.id.startsWith("field_")) {
        // Crear nuevo campo
        const fieldData = {
          name: editingField.name,
          key:
            editingField.key ||
            editingField.name.toLowerCase().replace(/\s+/g, "_"),
          type: editingField.type,
          required: editingField.required,
          options: editingField.options || [],
          pipeline: pipelineId,
        };

        const response = await dealsService.createDealField(fieldData);

        if (response.data) {
          // Recargar campos
          const fieldsResponse = await dealsService.getDealsFields(pipelineId);
          setDealsFields(fieldsResponse.data || []);
        }
      } else {
        // Actualizar campo existente
        const fieldData = {
          name: editingField.name,
          key: editingField.key,
          type: editingField.type,
          required: editingField.required,
          options: editingField.options || [],
          pipeline: pipelineId,
        };

        await dealsService.updateDealField(editingField.id, fieldData);

        // Actualizar estado local
        setDealsFields((prev) =>
          prev.map((field) =>
            field._id === editingField.id
              ? {
                  ...field,
                  name: editingField.name,
                  key: editingField.key,
                  type: editingField.type,
                  required: editingField.required,
                  options: editingField.options || [],
                }
              : field
          )
        );
      }

      setHasChanges(true);
      setEditingField(null);
    } catch (error) {
      console.error("Error al guardar campo:", error);
      alert("Error al guardar el campo");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este campo?")) {
      return;
    }

    try {
      setLoading(true);
      await dealsService.deleteDealField(fieldId);
      setDealsFields((prev) => prev.filter((field) => field._id !== fieldId));
      setHasChanges(true);
    } catch (error) {
      console.error("Error al eliminar campo:", error);
      alert("Error al eliminar el campo");
    } finally {
      setLoading(false);
    }
  };

  const loadDealsConfig = async () => {
    try {
      setInitialLoading(true);

      // Cargar pipelines
      const pipelinesResponse = await dealsService.getPipelines();
      const pipelinesData = pipelinesResponse.data || [];
      setPipelines(pipelinesData);

      // Si hay pipelines, cargar el primer pipeline por defecto
      if (pipelinesData.length > 0) {
        const firstPipelineId = pipelinesData[0]._id;
        setSelectedPipelineId(firstPipelineId);

        // Cargar statuses, campos y deals para el primer pipeline
        const [statusesResponse, fieldsResponse, dealsResponse] =
          await Promise.all([
            dealsService.getStatuses(firstPipelineId),
            dealsService.getDealsFields(firstPipelineId),
            dealsService.getDeals(firstPipelineId, { limit: 1000, page: 1 }),
          ]);

        const statusesData = statusesResponse.data || [];
        const dealsData = dealsResponse.data || [];

        // Contar deals por status
        const counts: Record<string, number> = {};

        // Inicializar contadores en 0
        statusesData.forEach((status: APIStatus) => {
          counts[status._id] = 0;
        });

        // Contar deals por cada status
        dealsData.forEach((deal: any) => {
          if (deal.status) {
            let statusId: string | null = null;

            // Manejar diferentes formatos del status
            if (typeof deal.status === "string") {
              statusId = deal.status;
            } else if (deal.status._id) {
              statusId = deal.status._id;
            } else if (deal.status.toString) {
              statusId = deal.status.toString();
            }

            // Incrementar contador si encontramos el status
            if (statusId && counts.hasOwnProperty(statusId)) {
              counts[statusId]++;
            }
          }
        });

        console.log("Conteo de deals por status:", counts);
        console.log("Total deals:", dealsData.length);
        console.log("Deals data sample:", dealsData.slice(0, 3));
        console.log(
          "Statuses data:",
          statusesData.map((s: APIStatus) => ({ id: s._id, name: s.name }))
        );

        // Log detallado de algunos deals para entender la estructura
        if (dealsData.length > 0) {
          console.log("Estructura del primer deal:", dealsData[0]);
          console.log("Status del primer deal:", dealsData[0]?.status);
          console.log("Tipo del status:", typeof dealsData[0]?.status);
        }

        setStatuses(statusesData);
        setDealsFields(fieldsResponse.data || []);
        setDealsCount(counts);
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error);
      alert("Error al cargar la configuración");
    } finally {
      setInitialLoading(false);
    }
  };

  // Cargar datos cuando cambia el pipeline seleccionado
  const loadPipelineData = async (pipelineId: string) => {
    if (!pipelineId) {
      setStatuses([]);
      setDealsFields([]);
      setDealsCount({});
      return;
    }

    try {
      setLoading(true);

      const [statusesResponse, fieldsResponse, dealsResponse] =
        await Promise.all([
          dealsService.getStatuses(pipelineId),
          dealsService.getDealsFields(pipelineId),
          dealsService.getDeals(pipelineId, { limit: 1000, page: 1 }), // Obtener todos los deals para contar
        ]);

      const statusesData = statusesResponse.data || [];
      const dealsData = dealsResponse.data || [];

      // Contar deals por status
      const counts: Record<string, number> = {};

      // Inicializar contadores en 0
      statusesData.forEach((status: APIStatus) => {
        counts[status._id] = 0;
      });

      // Contar deals por cada status
      dealsData.forEach((deal: any) => {
        if (deal.status) {
          let statusId: string | null = null;

          // Manejar diferentes formatos del status
          if (typeof deal.status === "string") {
            statusId = deal.status;
          } else if (deal.status._id) {
            statusId = deal.status._id;
          } else if (deal.status.toString) {
            statusId = deal.status.toString();
          }

          // Incrementar contador si encontramos el status
          if (statusId && counts.hasOwnProperty(statusId)) {
            counts[statusId]++;
          }
        }
      });

      console.log("Conteo de deals por status:", counts);
      console.log("Total deals:", dealsData.length);
      console.log("Deals data sample:", dealsData.slice(0, 3));
      console.log(
        "Statuses data:",
        statusesData.map((s: APIStatus) => ({ id: s._id, name: s.name }))
      );

      // Log detallado de algunos deals para entender la estructura
      if (dealsData.length > 0) {
        console.log("Estructura del primer deal:", dealsData[0]);
        console.log("Status del primer deal:", dealsData[0]?.status);
        console.log("Tipo del status:", typeof dealsData[0]?.status);
      }

      setStatuses(statusesData);
      setDealsFields(fieldsResponse.data || []);
      setDealsCount(counts);
    } catch (error) {
      console.error("Error al cargar datos del pipeline:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar solo el conteo de deals
  const refreshDealsCount = async (pipelineId: string) => {
    if (!pipelineId) return;

    try {
      const dealsResponse = await dealsService.getDeals(pipelineId, {
        limit: 1000,
        page: 1,
      });
      const dealsData = dealsResponse.data || [];

      // Recalcular conteos
      const counts: Record<string, number> = {};

      // Inicializar contadores en 0
      statuses.forEach((status: APIStatus) => {
        counts[status._id] = 0;
      });

      // Contar deals por cada status
      dealsData.forEach((deal: any) => {
        if (deal.status) {
          let statusId: string | null = null;

          if (typeof deal.status === "string") {
            statusId = deal.status;
          } else if (deal.status._id) {
            statusId = deal.status._id;
          } else if (deal.status.toString) {
            statusId = deal.status.toString();
          }

          if (statusId && counts.hasOwnProperty(statusId)) {
            counts[statusId]++;
          }
        }
      });

      setDealsCount(counts);
      console.log("Conteo actualizado:", counts);
    } catch (error) {
      console.error("Error al actualizar conteo de deals:", error);
    }
  };

  // Función para reordenar posiciones consecutivamente
  const reorderStatusPositions = async (pipelineId: string) => {
    try {
      const pipelineStatuses = statuses
        .filter((s) => s.pipeline === pipelineId)
        .sort((a, b) => a.order - b.order);

      // Actualizar posiciones para que sean consecutivas (0, 1, 2, ...)
      const updates = pipelineStatuses
        .map((status, index) => {
          if (status.order !== index) {
            return dealsService.updateStatus(status._id, {
              name: status.name,
              color: status.color,
              order: index,
            });
          }
          return null;
        })
        .filter(Boolean);

      if (updates.length > 0) {
        await Promise.all(updates);

        // Actualizar estado local
        const updatedStatuses = statuses.map((status) => {
          if (status.pipeline === pipelineId) {
            const newIndex = pipelineStatuses.findIndex(
              (s) => s._id === status._id
            );
            return { ...status, order: newIndex };
          }
          return status;
        });

        setStatuses(updatedStatuses);
      }
    } catch (error) {
      console.error("Error al reordenar posiciones:", error);
    }
  };

  useEffect(() => {
    loadDealsConfig();
  }, []);

  useEffect(() => {
    if (selectedPipelineId) {
      loadPipelineData(selectedPipelineId);
    }
  }, [selectedPipelineId]);

  // Filtrar columnas y campos por pipeline seleccionado
  const filteredStatuses = statuses.filter(
    (status) => !selectedPipelineId || status.pipeline === selectedPipelineId
  );

  const filteredFields = dealsFields.filter(
    (field) => !selectedPipelineId || field.pipeline === selectedPipelineId
  );

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
        {/* Selector de Pipeline */}
        {pipelines.length > 1 && (
          <div className="bg-white rounded-lg border p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pipeline Activo
            </label>
            <select
              value={selectedPipelineId}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            >
              <option value="">Todos los pipelines</option>
              {pipelines.map((pipeline) => (
                <option key={pipeline._id} value={pipeline._id}>
                  {pipeline.title}
                </option>
              ))}
            </select>
          </div>
        )}

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
                          >
                            <Edit2 className="w-4 h-4" />
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

        {/* Columns */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">
              Columnas{" "}
              {selectedPipelineId &&
                `(${
                  pipelines.find((p) => p._id === selectedPipelineId)?.title
                })`}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  refreshDealsCount(selectedPipelineId || pipelines[0]?._id)
                }
                disabled={loading || pipelines.length === 0}
                title="Refrescar conteo de deals"
              >
                <CircleDot className="w-4 h-4 mr-2" />
                Refrescar
              </Button>
              <Button
                onClick={handleAddColumn}
                disabled={loading || pipelines.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Columna
              </Button>
            </div>
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
                    Posición
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deals
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStatuses
                  .sort((a, b) => a.order - b.order)
                  .map((column) => (
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
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={
                              loading ||
                              filteredStatuses.findIndex(
                                (s) => s._id === column._id
                              ) === 0
                            }
                            onClick={() => handleMoveColumn(column._id, "up")}
                            title="Mover hacia arriba"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <span className="text-sm text-gray-500 min-w-[20px] text-center">
                            {filteredStatuses.findIndex(
                              (s) => s._id === column._id
                            ) + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={
                              loading ||
                              filteredStatuses.findIndex(
                                (s) => s._id === column._id
                              ) ===
                                filteredStatuses.length - 1
                            }
                            onClick={() => handleMoveColumn(column._id, "down")}
                            title="Mover hacia abajo"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              dealsCount[column._id] > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {dealsCount[column._id] || 0} deals
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditColumn(column)}
                            disabled={loading}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteColumn(column._id)}
                            disabled={loading}
                            title="Eliminar columna"
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
              Campos Personalizados{" "}
              {selectedPipelineId &&
                `(${
                  pipelines.find((p) => p._id === selectedPipelineId)?.title
                })`}
            </h3>
            <Button
              onClick={handleAddCustomField}
              disabled={loading || pipelines.length === 0}
            >
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
                {filteredFields.map((field) => (
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
                          onClick={() => handleEditField(field)}
                          disabled={loading}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteField(field._id)}
                          disabled={loading}
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingPipeline.id.startsWith("pipeline_")
                ? "Nuevo Pipeline"
                : "Editar Pipeline"}
            </h3>
            <div className="space-y-4">
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="Nombre del pipeline"
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
                  placeholder="Descripción del pipeline"
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
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSavePipeline} disabled={loading}>
                <Check className="w-4 h-4 mr-2" />
                {loading ? "Guardando..." : "Guardar"}
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
              {editingColumn.id.startsWith("column_")
                ? "Nueva Columna"
                : "Editar Columna"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre *
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
                  placeholder="Nombre de la columna"
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
                  {pipelines.map((pipeline) => (
                    <option key={pipeline._id} value={pipeline._id}>
                      {pipeline.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEditingColumn(null)}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSaveColumn} disabled={loading}>
                <Check className="w-4 h-4 mr-2" />
                {loading ? "Guardando..." : "Guardar"}
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
              {editingField.id.startsWith("field_")
                ? "Nuevo Campo"
                : "Editar Campo"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre *
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
                  placeholder="Nombre del campo"
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
                          placeholder="Opción"
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
              <Button
                variant="outline"
                onClick={() => setEditingField(null)}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSaveField} disabled={loading}>
                <Check className="w-4 h-4 mr-2" />
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
