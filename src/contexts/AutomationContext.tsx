import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { Node, Edge, Connection, addEdge } from "reactflow";
import {
  automationService,
  Automation,
  NodeType,
  ModuleEvent,
} from "../services/automationService";
import { webhookService } from "../services/webhookService";
import { useToast } from "../components/ui/toast";
import { useAuthStore } from "../store/authStore";

// Tipos para el contexto
interface AutomationState {
  // Datos del workflow actual
  currentWorkflow: {
    id: string | null;
    name: string;
    description: string;
    nodes: Node[];
    edges: Edge[];
    isActive: boolean;
  };

  // Lista de automatizaciones
  automations: Automation[];

  // Estados de carga
  loading: {
    workflows: boolean;
    saving: boolean;
    executing: boolean;
    deleting: boolean;
  };

  // Catálogos
  catalogs: {
    nodeTypes: NodeType[];
    modules: ModuleEvent[];
    isLoadingNodeTypes: boolean;
    isLoadingModules: boolean;
  };

  // Estado del editor
  editor: {
    isEditMode: boolean;
    hasUnsavedChanges: boolean;
    selectedNodeId: string | null;
    activePath: string[];
    history: HistoryState[];
    currentHistoryIndex: number;
  };

  // Errores
  error: string | null;
}

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
  name: string;
  description: string;
}

// Acciones del reducer
type AutomationAction =
  | {
      type: "SET_LOADING";
      payload: { key: keyof AutomationState["loading"]; value: boolean };
    }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_AUTOMATIONS"; payload: Automation[] }
  | { type: "ADD_AUTOMATION"; payload: Automation }
  | { type: "UPDATE_AUTOMATION"; payload: Automation }
  | { type: "DELETE_AUTOMATION"; payload: string }
  | {
      type: "SET_CURRENT_WORKFLOW";
      payload: Partial<AutomationState["currentWorkflow"]>;
    }
  | { type: "SET_NODES"; payload: Node[] }
  | { type: "SET_EDGES"; payload: Edge[] }
  | { type: "ADD_NODE"; payload: Node }
  | { type: "UPDATE_NODE"; payload: { id: string; data: any } }
  | { type: "DELETE_NODE"; payload: string }
  | {
      type: "SET_CATALOGS";
      payload: { nodeTypes?: NodeType[]; modules?: ModuleEvent[] };
    }
  | {
      type: "SET_CATALOG_LOADING";
      payload: { nodeTypes?: boolean; modules?: boolean };
    }
  | { type: "SET_EDIT_MODE"; payload: boolean }
  | { type: "SET_UNSAVED_CHANGES"; payload: boolean }
  | { type: "SET_SELECTED_NODE"; payload: string | null }
  | { type: "SET_ACTIVE_PATH"; payload: string[] }
  | { type: "ADD_TO_HISTORY" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET_WORKFLOW" }
  | { type: "CREATE_NEW_WORKFLOW" };

// Estado inicial
const initialState: AutomationState = {
  currentWorkflow: {
    id: null,
    name: "Untitled Workflow",
    description: "",
    nodes: [],
    edges: [],
    isActive: false,
  },
  automations: [],
  loading: {
    workflows: false,
    saving: false,
    executing: false,
    deleting: false,
  },
  catalogs: {
    nodeTypes: [],
    modules: [],
    isLoadingNodeTypes: false,
    isLoadingModules: false,
  },
  editor: {
    isEditMode: false,
    hasUnsavedChanges: false,
    selectedNodeId: null,
    activePath: [],
    history: [],
    currentHistoryIndex: -1,
  },
  error: null,
};

// Reducer
function automationReducer(
  state: AutomationState,
  action: AutomationAction
): AutomationState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    case "SET_AUTOMATIONS":
      return {
        ...state,
        automations: action.payload,
      };

    case "ADD_AUTOMATION":
      return {
        ...state,
        automations: [...state.automations, action.payload],
      };

    case "UPDATE_AUTOMATION":
      return {
        ...state,
        automations: state.automations.map((automation) =>
          automation.id === action.payload.id ? action.payload : automation
        ),
      };

    case "DELETE_AUTOMATION":
      return {
        ...state,
        automations: state.automations.filter(
          (automation) => automation.id !== action.payload
        ),
      };

    case "SET_CURRENT_WORKFLOW":
      return {
        ...state,
        currentWorkflow: {
          ...state.currentWorkflow,
          ...action.payload,
        },
      };

    case "SET_NODES":
      return {
        ...state,
        currentWorkflow: {
          ...state.currentWorkflow,
          nodes: action.payload,
        },
        editor: {
          ...state.editor,
          hasUnsavedChanges: true,
        },
      };

    case "SET_EDGES":
      return {
        ...state,
        currentWorkflow: {
          ...state.currentWorkflow,
          edges: action.payload,
        },
        editor: {
          ...state.editor,
          hasUnsavedChanges: true,
        },
      };

    case "ADD_NODE":
      return {
        ...state,
        currentWorkflow: {
          ...state.currentWorkflow,
          nodes: [...state.currentWorkflow.nodes, action.payload],
        },
        editor: {
          ...state.editor,
          hasUnsavedChanges: true,
        },
      };

    case "UPDATE_NODE":
      return {
        ...state,
        currentWorkflow: {
          ...state.currentWorkflow,
          nodes: state.currentWorkflow.nodes.map((node) =>
            node.id === action.payload.id
              ? { ...node, data: { ...node.data, ...action.payload.data } }
              : node
          ),
        },
        editor: {
          ...state.editor,
          hasUnsavedChanges: true,
        },
      };

    case "DELETE_NODE":
      console.log("🔥 DELETE_NODE reducer case triggered", {
        nodeIdToDelete: action.payload,
        currentNodes: state.currentWorkflow.nodes.map((n) => n.id),
        currentEdges: state.currentWorkflow.edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
        })),
      });

      const filteredNodes = state.currentWorkflow.nodes.filter(
        (node) => node.id !== action.payload
      );
      const filteredEdges = state.currentWorkflow.edges.filter(
        (edge) =>
          edge.source !== action.payload && edge.target !== action.payload
      );

      console.log("📊 DELETE_NODE result", {
        originalNodeCount: state.currentWorkflow.nodes.length,
        newNodeCount: filteredNodes.length,
        originalEdgeCount: state.currentWorkflow.edges.length,
        newEdgeCount: filteredEdges.length,
        deletedNodeId: action.payload,
      });

      return {
        ...state,
        currentWorkflow: {
          ...state.currentWorkflow,
          nodes: filteredNodes,
          edges: filteredEdges,
        },
        editor: {
          ...state.editor,
          hasUnsavedChanges: true,
        },
      };

    case "SET_CATALOGS":
      return {
        ...state,
        catalogs: {
          ...state.catalogs,
          nodeTypes: Array.isArray(action.payload.nodeTypes)
            ? action.payload.nodeTypes
            : state.catalogs.nodeTypes,
          modules: Array.isArray(action.payload.modules)
            ? action.payload.modules
            : state.catalogs.modules,
        },
      };

    case "SET_CATALOG_LOADING":
      return {
        ...state,
        catalogs: {
          ...state.catalogs,
          isLoadingNodeTypes:
            action.payload.nodeTypes ?? state.catalogs.isLoadingNodeTypes,
          isLoadingModules:
            action.payload.modules ?? state.catalogs.isLoadingModules,
        },
      };

    case "SET_EDIT_MODE":
      return {
        ...state,
        editor: {
          ...state.editor,
          isEditMode: action.payload,
        },
      };

    case "SET_UNSAVED_CHANGES":
      return {
        ...state,
        editor: {
          ...state.editor,
          hasUnsavedChanges: action.payload,
        },
      };

    case "SET_SELECTED_NODE":
      return {
        ...state,
        editor: {
          ...state.editor,
          selectedNodeId: action.payload,
        },
      };

    case "SET_ACTIVE_PATH":
      return {
        ...state,
        editor: {
          ...state.editor,
          activePath: action.payload,
        },
      };

    case "ADD_TO_HISTORY":
      const newHistoryState: HistoryState = {
        nodes: state.currentWorkflow.nodes,
        edges: state.currentWorkflow.edges,
        name: state.currentWorkflow.name,
        description: state.currentWorkflow.description,
      };

      const newHistory = state.editor.history.slice(
        0,
        state.editor.currentHistoryIndex + 1
      );
      newHistory.push(newHistoryState);

      return {
        ...state,
        editor: {
          ...state.editor,
          history: newHistory.slice(-50), // Mantener solo los últimos 50 estados
          currentHistoryIndex: Math.min(newHistory.length - 1, 49),
        },
      };

    case "UNDO":
      if (state.editor.currentHistoryIndex > 0) {
        const previousState =
          state.editor.history[state.editor.currentHistoryIndex - 1];
        return {
          ...state,
          currentWorkflow: {
            ...state.currentWorkflow,
            nodes: previousState.nodes,
            edges: previousState.edges,
            name: previousState.name,
            description: previousState.description,
          },
          editor: {
            ...state.editor,
            currentHistoryIndex: state.editor.currentHistoryIndex - 1,
            hasUnsavedChanges: true,
          },
        };
      }
      return state;

    case "REDO":
      if (state.editor.currentHistoryIndex < state.editor.history.length - 1) {
        const nextState =
          state.editor.history[state.editor.currentHistoryIndex + 1];
        return {
          ...state,
          currentWorkflow: {
            ...state.currentWorkflow,
            nodes: nextState.nodes,
            edges: nextState.edges,
            name: nextState.name,
            description: nextState.description,
          },
          editor: {
            ...state.editor,
            currentHistoryIndex: state.editor.currentHistoryIndex + 1,
            hasUnsavedChanges: true,
          },
        };
      }
      return state;

    case "RESET_WORKFLOW":
      return {
        ...state,
        currentWorkflow: {
          ...initialState.currentWorkflow,
        },
        editor: {
          ...state.editor,
          hasUnsavedChanges: false,
          selectedNodeId: null,
          activePath: [],
          history: [],
          currentHistoryIndex: -1,
        },
      };

    case "CREATE_NEW_WORKFLOW":
      console.log("✅ CREATE_NEW_WORKFLOW reducer - setting isEditMode: true");
      return {
        ...state,
        currentWorkflow: {
          ...initialState.currentWorkflow,
        },
        editor: {
          ...state.editor,
          isEditMode: true,
          hasUnsavedChanges: false,
          selectedNodeId: null,
          activePath: [],
          history: [],
          currentHistoryIndex: -1,
        },
      };

    default:
      return state;
  }
}

// Interfaz del contexto
interface AutomationContextType {
  // Estado
  state: AutomationState;

  // Operaciones de automatizaciones
  loadAutomations: (filters?: any) => Promise<void>;
  createAutomation: (data: Partial<Automation>) => Promise<Automation>;
  updateAutomation: (
    id: string,
    data: Partial<Automation>
  ) => Promise<Automation>;
  deleteAutomation: (id: string) => Promise<void>;
  toggleAutomationActive: (id: string) => Promise<void>;
  executeAutomation: (id: string) => Promise<void>;

  // Operaciones del workflow actual
  loadWorkflow: (id: string) => Promise<void>;
  saveCurrentWorkflow: () => Promise<void>;
  createNewWorkflow: () => void;
  resetWorkflow: () => void;

  // Operaciones de nodos y edges
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  addNode: (node: Node) => boolean;
  updateNode: (id: string, data: any) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  onConnect: (connection: Connection) => void;

  // Operaciones del editor
  toggleEditMode: () => void;
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (description: string) => void;
  setSelectedNode: (nodeId: string | null) => void;

  // Historial
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  addToHistory: () => void;

  // Catálogos
  loadNodeTypes: () => Promise<void>;
  loadModules: () => Promise<void>;

  // Utilidades
  clearError: () => void;
  validateWorkflow: () => boolean;
}

// Crear el contexto
const AutomationContext = createContext<AutomationContextType | null>(null);

// Provider del contexto
export function AutomationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(automationReducer, initialState);
  const toast = useToast();

  // Función para manejar errores
  const handleError = useCallback(
    (error: any, customMessage?: string) => {
      const message = customMessage || error?.message || "Ha ocurrido un error";
      dispatch({ type: "SET_ERROR", payload: message });
      toast.show({
        title: "Error",
        description: message,
        type: "error",
      });
    },
    [toast]
  );

  // Función para mostrar éxito
  const showSuccess = useCallback(
    (message: string) => {
      toast.show({
        title: "Éxito",
        description: message,
        type: "success",
      });
    },
    [toast]
  );

  // Operaciones de automatizaciones
  const loadAutomations = useCallback(
    async (filters?: any) => {
      try {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "workflows", value: true },
        });
        dispatch({ type: "SET_ERROR", payload: null });

        const response = await automationService.getAutomations(filters);
        dispatch({
          type: "SET_AUTOMATIONS",
          payload: response,
        });
      } catch (error) {
        handleError(error, "Error al cargar las automatizaciones");
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "workflows", value: false },
        });
      }
    },
    [handleError]
  );

  const createAutomation = useCallback(
    async (data: Partial<Automation>) => {
      try {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "saving", value: true },
        });

        const automation = await automationService.createAutomation(data);
        dispatch({ type: "ADD_AUTOMATION", payload: automation });
        showSuccess("Automatización creada exitosamente");

        return automation;
      } catch (error) {
        handleError(error, "Error al crear la automatización");
        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "saving", value: false },
        });
      }
    },
    [handleError, showSuccess]
  );

  const updateAutomation = useCallback(
    async (id: string, data: Partial<Automation>) => {
      try {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "saving", value: true },
        });

        const automation = await automationService.updateAutomation(id, data);
        dispatch({ type: "UPDATE_AUTOMATION", payload: automation });
        showSuccess("Automatización actualizada exitosamente");

        return automation;
      } catch (error) {
        handleError(error, "Error al actualizar la automatización");
        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "saving", value: false },
        });
      }
    },
    [handleError, showSuccess]
  );

  const deleteAutomation = useCallback(
    async (id: string) => {
      try {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "deleting", value: true },
        });

        await automationService.deleteAutomation(id);
        dispatch({ type: "DELETE_AUTOMATION", payload: id });
        showSuccess("Automatización eliminada exitosamente");
      } catch (error) {
        handleError(error, "Error al eliminar la automatización");
        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "deleting", value: false },
        });
      }
    },
    [handleError, showSuccess]
  );

  const toggleAutomationActive = useCallback(
    async (id: string) => {
      try {
        const automation = await automationService.toggleAutomationActive(id);
        dispatch({ type: "UPDATE_AUTOMATION", payload: automation });

        // Si es el workflow actual, actualizar también
        if (state.currentWorkflow.id === id) {
          dispatch({
            type: "SET_CURRENT_WORKFLOW",
            payload: { isActive: automation.status === "active" },
          });
        }

        showSuccess(
          `Automatización ${
            automation.status === "active" ? "activada" : "desactivada"
          } exitosamente`
        );
      } catch (error) {
        handleError(error, "Error al cambiar el estado de la automatización");
        throw error;
      }
    },
    [handleError, showSuccess, state.currentWorkflow.id]
  );

  const executeAutomation = useCallback(
    async (id: string) => {
      try {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "executing", value: true },
        });

        await automationService.executeAutomation(id);
        showSuccess("Automatización ejecutada exitosamente");
      } catch (error) {
        handleError(error, "Error al ejecutar la automatización");
        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "executing", value: false },
        });
      }
    },
    [handleError, showSuccess]
  );

  // Operaciones del workflow actual
  const loadWorkflow = useCallback(
    async (id: string) => {
      try {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "workflows", value: true },
        });
        dispatch({ type: "SET_ERROR", payload: null });

        const automation = await automationService.getAutomation(id);

        // Convertir AutomationNode[] a Node[] si es necesario
        const nodes: Node[] =
          automation.nodes?.map((node: any) => ({
            id: node.id,
            type: node.type,
            position: node.position || { x: 0, y: 0 },
            data: node.data || {},
            sourcePosition: node.sourcePosition as any,
            targetPosition: node.targetPosition as any,
          })) || [];

        dispatch({
          type: "SET_CURRENT_WORKFLOW",
          payload: {
            id: automation.id,
            name: automation.name,
            description: automation.description,
            nodes,
            edges: [], // Se generarán desde los nodos
            isActive: automation.status === "active",
          },
        });

        dispatch({ type: "SET_UNSAVED_CHANGES", payload: false });
        dispatch({ type: "ADD_TO_HISTORY" });
      } catch (error) {
        handleError(error, "Error al cargar el workflow");
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "workflows", value: false },
        });
      }
    },
    [handleError]
  );

  const saveCurrentWorkflow = useCallback(async () => {
    try {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "saving", value: true },
      });

      // Convertir Node[] a AutomationNode[] para la API
      const automationNodes = state.currentWorkflow.nodes.map((node) => ({
        id: node.id,
        type: node.type || "default",
        data: node.data,
        position: node.position,
        sourcePosition: node.sourcePosition as string | undefined,
        targetPosition: node.targetPosition as string | undefined,
      }));

      const workflowData = {
        name: state.currentWorkflow.name,
        description: state.currentWorkflow.description,
        nodes: automationNodes,
        status: (state.currentWorkflow.isActive ? "active" : "inactive") as
          | "active"
          | "inactive",
      };

      let result;
      if (state.currentWorkflow.id) {
        result = await updateAutomation(state.currentWorkflow.id, workflowData);
      } else {
        result = await createAutomation(workflowData);
        dispatch({ type: "SET_CURRENT_WORKFLOW", payload: { id: result.id } });
      }

      dispatch({ type: "SET_UNSAVED_CHANGES", payload: false });
      showSuccess("Workflow guardado exitosamente");
    } catch (error) {
      handleError(error, "Error al guardar el workflow");
      throw error;
    } finally {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "saving", value: false },
      });
    }
  }, [
    state.currentWorkflow,
    updateAutomation,
    createAutomation,
    handleError,
    showSuccess,
  ]);

  const createNewWorkflow = useCallback(() => {
    console.log("🚀 Creating new workflow - activating edit mode");
    dispatch({ type: "CREATE_NEW_WORKFLOW" });
    dispatch({ type: "ADD_TO_HISTORY" });
  }, []);

  const resetWorkflow = useCallback(() => {
    dispatch({ type: "RESET_WORKFLOW" });
  }, []);

  // Operaciones de nodos y edges
  const setNodes = useCallback(
    (nodes: Node[] | ((nodes: Node[]) => Node[])) => {
      const newNodes =
        typeof nodes === "function"
          ? nodes(state.currentWorkflow.nodes)
          : nodes;
      dispatch({ type: "SET_NODES", payload: newNodes });
      dispatch({ type: "ADD_TO_HISTORY" });
    },
    [state.currentWorkflow.nodes]
  );

  const setEdges = useCallback(
    (edges: Edge[] | ((edges: Edge[]) => Edge[])) => {
      const newEdges =
        typeof edges === "function"
          ? edges(state.currentWorkflow.edges)
          : edges;
      dispatch({ type: "SET_EDGES", payload: newEdges });
      dispatch({ type: "ADD_TO_HISTORY" });
    },
    [state.currentWorkflow.edges]
  );

  const addNode = useCallback(
    (node: Node) => {
      // Validar que solo haya un trigger
      const nodeCategory = getNodeCategory(node.type || "");
      if (nodeCategory === "trigger") {
        const existingTrigger = state.currentWorkflow.nodes.some(
          (n) => getNodeCategory(n.type || "") === "trigger"
        );
        if (existingTrigger) {
          handleError(null, "Solo se permite un nodo disparador por workflow");
          return false;
        }
      }

      dispatch({ type: "ADD_NODE", payload: node });
      dispatch({ type: "ADD_TO_HISTORY" });
      return true;
    },
    [state.currentWorkflow.nodes, handleError]
  );

  const updateNode = useCallback((id: string, data: any) => {
    dispatch({ type: "UPDATE_NODE", payload: { id, data } });
    dispatch({ type: "ADD_TO_HISTORY" });
  }, []);

  const deleteNode = useCallback(
    (id: string) => {
      console.log("🗑️ Context deleteNode called with id:", id);
      console.log(
        "📊 Current nodes before deletion:",
        state.currentWorkflow.nodes.map((n) => n.id)
      );

      dispatch({ type: "DELETE_NODE", payload: id });
      dispatch({ type: "ADD_TO_HISTORY" });

      console.log("✅ DELETE_NODE action dispatched for:", id);
    },
    [state.currentWorkflow.nodes]
  );

  const duplicateNode = useCallback(
    (id: string) => {
      const originalNode = state.currentWorkflow.nodes.find(
        (node) => node.id === id
      );
      if (originalNode) {
        const newNode = {
          ...originalNode,
          id: `node_${Date.now()}`,
          position: {
            x: originalNode.position.x + 50,
            y: originalNode.position.y + 50,
          },
        };
        dispatch({ type: "ADD_NODE", payload: newNode });
        dispatch({ type: "ADD_TO_HISTORY" });
      }
    },
    [state.currentWorkflow.nodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!state.editor.isEditMode) return;

      setEdges((edges) => addEdge(connection, edges));
    },
    [state.editor.isEditMode, setEdges]
  );

  // Operaciones del editor
  const toggleEditMode = useCallback(() => {
    dispatch({ type: "SET_EDIT_MODE", payload: !state.editor.isEditMode });
  }, [state.editor.isEditMode]);

  const setWorkflowName = useCallback((name: string) => {
    dispatch({ type: "SET_CURRENT_WORKFLOW", payload: { name } });
    dispatch({ type: "SET_UNSAVED_CHANGES", payload: true });
  }, []);

  const setWorkflowDescription = useCallback((description: string) => {
    dispatch({ type: "SET_CURRENT_WORKFLOW", payload: { description } });
    dispatch({ type: "SET_UNSAVED_CHANGES", payload: true });
  }, []);

  const setSelectedNode = useCallback((nodeId: string | null) => {
    dispatch({ type: "SET_SELECTED_NODE", payload: nodeId });
  }, []);

  // Historial
  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const canUndo = useCallback(() => {
    return state.editor.currentHistoryIndex > 0;
  }, [state.editor.currentHistoryIndex]);

  const canRedo = useCallback(() => {
    return state.editor.currentHistoryIndex < state.editor.history.length - 1;
  }, [state.editor.currentHistoryIndex, state.editor.history.length]);

  const addToHistory = useCallback(() => {
    dispatch({ type: "ADD_TO_HISTORY" });
  }, []);

  // Catálogos
  const loadNodeTypes = useCallback(async () => {
    try {
      dispatch({ type: "SET_CATALOG_LOADING", payload: { nodeTypes: true } });

      const nodeTypes = await automationService.getNodeTypes();
      dispatch({ type: "SET_CATALOGS", payload: { nodeTypes } });
    } catch (error) {
      handleError(error, "Error al cargar los tipos de nodos");
    } finally {
      dispatch({ type: "SET_CATALOG_LOADING", payload: { nodeTypes: false } });
    }
  }, [handleError]);

  const loadModules = useCallback(async () => {
    try {
      dispatch({ type: "SET_CATALOG_LOADING", payload: { modules: true } });

      const modules = await automationService.getAvailableModules();
      dispatch({ type: "SET_CATALOGS", payload: { modules } });
    } catch (error) {
      handleError(error, "Error al cargar los módulos");
    } finally {
      dispatch({ type: "SET_CATALOG_LOADING", payload: { modules: false } });
    }
  }, [handleError]);

  // Utilidades
  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: null });
  }, []);

  const validateWorkflow = useCallback(() => {
    const { nodes } = state.currentWorkflow;

    // Debe tener al menos un trigger
    const hasTrigger = nodes.some(
      (node) => getNodeCategory(node.type || "") === "trigger"
    );
    if (!hasTrigger) {
      handleError(null, "El workflow debe tener al menos un nodo disparador");
      return false;
    }

    // Validar que todos los nodos tengan configuración válida
    for (const node of nodes) {
      if (!node.data || Object.keys(node.data).length === 0) {
        handleError(null, `El nodo ${node.id} necesita configuración`);
        return false;
      }
    }

    return true;
  }, [state.currentWorkflow, handleError]);

  // Cargar catálogos solo cuando el usuario esté autenticado
  useEffect(() => {
    // Comentar la carga automática para evitar errores en login/registro
    // const { isAuthenticated, user } = useAuthStore.getState();
    // // Solo cargar si el usuario está autenticado y tiene datos válidos
    // if (isAuthenticated && user) {
    //   console.log(
    //     "🔄 AutomationProvider: Loading catalogs for authenticated user"
    //   );
    //   loadNodeTypes();
    //   loadModules();
    // } else {
    //   console.log(
    //     "⏳ AutomationProvider: Waiting for authentication before loading catalogs"
    //   );
    // }
  }, [loadNodeTypes, loadModules]);

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((authState) => {
      // Comentar la carga automática para evitar errores en login/registro
      // // Si el usuario se autentica y no tenemos catálogos cargados, cargarlos
      // if (
      //   authState.isAuthenticated &&
      //   authState.user &&
      //   state.catalogs.nodeTypes.length === 0 &&
      //   state.catalogs.modules.length === 0
      // ) {
      //   console.log(
      //     "🔄 AutomationProvider: User authenticated, loading catalogs"
      //   );
      //   loadNodeTypes();
      //   loadModules();
      // }

      // Si el usuario se desautentica, limpiar los catálogos
      if (!authState.isAuthenticated) {
        console.log(
          "🧹 AutomationProvider: User logged out, clearing catalogs"
        );
        dispatch({
          type: "SET_CATALOGS",
          payload: { nodeTypes: [], modules: [] },
        });
      }
    });

    return unsubscribe;
  }, [
    loadNodeTypes,
    loadModules,
    state.catalogs.nodeTypes.length,
    state.catalogs.modules.length,
  ]);

  const contextValue: AutomationContextType = {
    state,
    loadAutomations,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomationActive,
    executeAutomation,
    loadWorkflow,
    saveCurrentWorkflow,
    createNewWorkflow,
    resetWorkflow,
    setNodes,
    setEdges,
    addNode,
    updateNode,
    deleteNode,
    duplicateNode,
    onConnect,
    toggleEditMode,
    setWorkflowName,
    setWorkflowDescription,
    setSelectedNode,
    undo,
    redo,
    canUndo,
    canRedo,
    addToHistory,
    loadNodeTypes,
    loadModules,
    clearError,
    validateWorkflow,
  };

  return (
    <AutomationContext.Provider value={contextValue}>
      {children}
    </AutomationContext.Provider>
  );
}

// Hook para usar el contexto
export function useAutomation() {
  const context = useContext(AutomationContext);
  if (!context) {
    throw new Error(
      "useAutomation debe ser usado dentro de AutomationProvider"
    );
  }
  return context;
}

// Función auxiliar para obtener la categoría del nodo
function getNodeCategory(nodeType: string): string {
  if (nodeType.includes("trigger")) return "trigger";
  if (nodeType.includes("condition")) return "condition";
  return "action";
}
