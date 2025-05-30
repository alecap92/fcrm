import React, { useCallback, useRef, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  addEdge,
  Connection,
  useReactFlow,
  Edge,
  EdgeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";

import { Sidebar } from "../components/Sidebar";
import { nodeTypes, edgeTypes } from "../components/NodeTypes";
import { useWorkflowStore } from "../store/workflow";
import { Button } from "../components/ui/button";
import {
  Edit2,
  AlertCircle,
  Trash2,
  Save,
  Undo2,
  Redo2,
  Home,
  Play,
  Loader2,
} from "lucide-react";

import { ExecutionHistoryModal } from "../components/ExecutionHistoryModal";
import { useToast } from "../components/ui/toast";

let id = 0;
const getId = () => `node_${id++}`;

const WorkflowCanvas = () => {
  const { id: workflowId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showExecutionHistory, setShowExecutionHistory] = useState(false);

  const toast = useToast();

  const {
    nodes,
    edges,
    setEdges,
    saveWorkflow,
    loadWorkflow,
    createNewWorkflow,
    executeWorkflow,
    loadNodeTypes,
    loadAvailableModules,
    toggleActive,
    activePath,
    error,
    clearError,
    addNode,
    resetWorkflow,
    name,
    description,
    setName,
    setDescription,
    isEditMode,
    toggleEditMode,
    removeEdge,
    undo,
    redo,
    canUndo,
    canRedo,
    hasUnsavedChanges,
    isActive,
    isLoading,
    isSaving,
    automationType,
    setAutomationType,
  } = useWorkflowStore();

  // Cargar datos iniciales
  useEffect(() => {
    // Cargar tipos de nodos y módulos disponibles (sólo una vez)
    loadNodeTypes();
    loadAvailableModules();

    // Cargar el workflow si hay un ID en la URL
    if (workflowId && workflowId !== "new") {
      loadWorkflow(workflowId);
    } else if (workflowId === "new") {
      createNewWorkflow();
      toggleEditMode();
    }
  }, [
    workflowId,
    loadNodeTypes,
    loadAvailableModules,
    loadWorkflow,
    createNewWorkflow,
    toggleEditMode,
  ]);

  // Manejar errores de API
  useEffect(() => {
    if (error) {
      toast.show({
        title: "Error",
        description: "No se pudieron cargar las integraciones",
        type: "error",
      });
    }
  }, [error]);

  const handleHomeClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      navigate("/automations");
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      if (!isEditMode) return;
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, isEditMode]
  );

  const onEdgeMouseEnter: EdgeMouseHandler = useCallback(
    (event, edge) => {
      if (!isEditMode) return;
      const edgeElement = event.target as HTMLElement;
      edgeElement.classList.add("hover:stroke-red-500", "cursor-pointer");
    },
    [isEditMode]
  );

  const onEdgeMouseLeave: EdgeMouseHandler = useCallback(
    (event) => {
      if (!isEditMode) return;
      const edgeElement = event.target as HTMLElement;
      edgeElement.classList.remove("hover:stroke-red-500", "cursor-pointer");
    },
    [isEditMode]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      if (!isEditMode) return;
      event.preventDefault();
      removeEdge(edge.id);
    },
    [removeEdge, isEditMode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!isEditMode) return;

      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = project({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      addNode(newNode);
    },
    [project, addNode, isEditMode]
  );

  const styledNodes = nodes.map((node) => ({
    ...node,
    style: {
      ...node.style,
      borderColor: activePath.includes(node.id) ? "#10B981" : undefined,
      borderWidth: activePath.includes(node.id) ? "2px" : undefined,
    },
  }));

  const hasTrigger = nodes.some((node) => node.type?.includes("trigger"));

  const handleSave = async () => {
    try {
      await saveWorkflow();
      toast.show({
        title: "Success",
        description: "Workflow saved successfully",
        type: "success",
      });
      toggleEditMode();
    } catch (err) {
      // Error ya manejado en el store
    }
  };

  const handleExecute = async () => {
    try {
      const result = await executeWorkflow();
      toast.show({
        title: "Success",
        description: "Workflow executed successfully",
        type: "success",
      });
      setShowExecutionHistory(true);
    } catch (err) {
      // Error ya manejado en el store
    }
  };

  const handleToggleActive = async () => {
    try {
      await toggleActive();
      toast.show({
        title: "Success",
        description: `Workflow ${
          isActive ? "deactivated" : "activated"
        } successfully`,
        type: "success",
      });
    } catch (err) {
      // Error ya manejado en el store
    }
  };

  return (
    <div className="flex h-screen">
      {isEditMode && <Sidebar />}
      <div className="flex-1 flex flex-col">
        <div className="h-24 border-b flex flex-col justify-between px-4 py-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                title="Go to Home"
              >
                <Home className="w-4 h-4" />
              </Button>
              {isEditingTitle ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setIsEditingTitle(false)
                  }
                  className="text-xl font-semibold bg-transparent border-b border-primary outline-none"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-xl font-semibold cursor-pointer hover:text-primary"
                  onClick={() => isEditMode && setIsEditingTitle(true)}
                >
                  {name}
                </h1>
              )}
              {isEditMode && (
                <>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={undo}
                      disabled={!canUndo()}
                      title="Undo"
                    >
                      <Undo2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={redo}
                      disabled={!canRedo()}
                      title="Redo"
                    >
                      <Redo2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <label className="text-sm text-gray-600">Tipo:</label>
                    <select
                      value={automationType}
                      onChange={(e) =>
                        setAutomationType(
                          e.target.value as "workflow" | "conversation"
                        )
                      }
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="workflow">Workflow Visual</option>
                      <option value="conversation">
                        Automatización WhatsApp
                      </option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {!isEditMode ? (
                <>
                  {/* Botones para modo vista */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleActive}
                    disabled={isLoading}
                    title={
                      isActive ? "Deactivate Automation" : "Activate Automation"
                    }
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <p>toggle</p>
                    )}
                    {isActive ? "Active" : "Inactive"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleEditMode}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleExecute}
                    disabled={isLoading || !isActive}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Execute
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExecutionHistory(true)}
                  >
                    History
                  </Button>
                </>
              ) : (
                <>
                  {/* Botones para modo edición */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={resetWorkflow}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSave}
                    disabled={!hasTrigger || isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            {isEditingDescription ? (
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => setIsEditingDescription(false)}
                onKeyDown={(e) =>
                  e.key === "Enter" && setIsEditingDescription(false)
                }
                className="text-sm text-gray-600 bg-transparent border-b border-primary outline-none w-full"
                placeholder="Add a description..."
                autoFocus
              />
            ) : (
              <p
                className="text-sm text-gray-600 cursor-pointer hover:text-primary"
                onClick={() => isEditMode && setIsEditingDescription(true)}
              >
                {description || "Add a description..."}
              </p>
            )}
            {automationType === "conversation" && !isEditMode && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Automatización WhatsApp
              </span>
            )}
          </div>
        </div>
        {error && (
          <div
            className="bg-red-50 border-l-4 border-red-400 p-4 flex items-center"
            onClick={clearError}
          >
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {isLoading && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-2 flex items-center">
            <Loader2 className="w-5 h-5 text-blue-400 mr-3 animate-spin" />
            <p className="text-blue-700">Loading workflow...</p>
          </div>
        )}
        {!nodes.length && isEditMode && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-500">
              <p className="text-xl mb-2">
                Start by dragging a trigger from the sidebar
              </p>
              <p className="text-sm">
                Your workflow must begin with a trigger event
              </p>
            </div>
          </div>
        )}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={styledNodes}
            edges={edges}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onEdgeMouseEnter={onEdgeMouseEnter}
            onEdgeMouseLeave={onEdgeMouseLeave}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            nodesDraggable={isEditMode}
            nodesConnectable={isEditMode}
            elementsSelectable={isEditMode}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>

      {/* Unsaved changes dialog */}
      {showUnsavedDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Unsaved Changes</h3>
            <p className="text-gray-600 mb-6">
              You have unsaved changes. Are you sure you want to leave? All
              changes will be lost.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowUnsavedDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => navigate("/automations")}
              >
                Leave Anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Execution history modal */}
      {showExecutionHistory && workflowId && (
        <ExecutionHistoryModal
          automationId={workflowId}
          onClose={() => setShowExecutionHistory(false)}
        />
      )}
    </div>
  );
};

export function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas />
    </ReactFlowProvider>
  );
}
