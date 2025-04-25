// src/store/workflow.ts
import { create } from "zustand";
import { Node, Edge } from "reactflow";
import {
  automationService,
  NodeType,
  ModuleEvent,
  Automation,
} from "../services/automationService";
import { webhookService } from "../services/webhookService";

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
  name: string;
  description: string;
}

interface WorkflowState {
  // Datos de flujo
  nodes: Node[];
  edges: Edge[];
  isActive: boolean;
  activePath: string[];
  error: string | null;
  name: string;
  description: string;
  isEditMode: boolean;
  hasUnsavedChanges: boolean;

  // Estado de la API
  workflowId: string | null;
  isLoading: boolean;
  isSaving: boolean;

  // Catálogos
  availableNodeTypes: NodeType[];
  availableModules: ModuleEvent[];
  isLoadingNodeTypes: boolean;
  isLoadingModules: boolean;

  // Historial
  history: HistoryState[];
  currentHistoryIndex: number;

  // Métodos para manipular el flujo
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  toggleActive: () => void;
  addNode: (node: Node) => boolean;
  updateNode: (nodeId: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;

  // Métodos para interactuar con la API
  saveWorkflow: () => Promise<Automation | undefined>;
  loadWorkflow: (id: string) => Promise<void>;
  createNewWorkflow: () => void;
  executeWorkflow: () => Promise<{ executionId: string } | undefined>;

  // Métodos para cargar catálogos
  loadNodeTypes: () => Promise<void>;
  loadAvailableModules: () => Promise<void>;

  // Validación y simulación
  simulateExecution: () => void;
  validateWorkflow: () => boolean;
  clearError: () => void;
  resetWorkflow: () => void;

  // Métodos para editar propiedades básicas
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  toggleEditMode: () => void;
  setWorkflowId: (id: string | null) => void;

  // Métodos para historial
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  addToHistory: () => void;
}

type NodeCategory = "trigger" | "action" | "condition";

const getNodeCategory = (type: string): NodeCategory => {
  if (type.includes("trigger")) return "trigger";
  if (type === "condition") return "condition";
  return "action";
};

let nodeIdCounter = 0;
const getNextNodeId = () => `node_${++nodeIdCounter}`;

const initialState = {
  nodes: [],
  edges: [],
  isActive: false,
  activePath: [],
  error: null,
  name: "Untitled Workflow",
  description: "",
  isEditMode: false,
  hasUnsavedChanges: false,
  workflowId: null,
  isLoading: false,
  isSaving: false,
  availableNodeTypes: [],
  availableModules: [],
  isLoadingNodeTypes: false,
  isLoadingModules: false,
  history: [],
  currentHistoryIndex: -1,
};

// Convertir de nodos de ReactFlow a formato de API
const formatNodeForBackend = (node: Node, nextNodes: string[]) => {
  const baseNode = {
    id: node.id,
    next: nextNodes,
  };

  // Manejo especial para todos los nodos trigger
  if (node.type?.includes("_trigger")) {
    // Extract the base type (module name) without '_trigger'
    const module = node.type.replace("_trigger", "");

    // Caso especial para el trigger manual
    if (module === "manual") {
      return {
        ...baseNode,
        type: "trigger",
        module: "manual",
        event: "manual_execution",
        payloadMatch: node.data?.payloadMatch || {},
      };
    }

    // Caso especial para webhook trigger
    if (module === "webhook") {
      return {
        ...baseNode,
        type: "trigger",
        module: "webhook",
        event: node.data?.event || "contact_form",
        webhookId: node.data?.webhookId || "",
        payloadMatch: node.data?.payloadMatch || {},
      };
    }

    // Determinar el evento adecuado según el módulo o usar datos del nodo
    let event = node.data?.event || "created"; // Valor predeterminado

    if (module === "deal" || module === "deals") {
      event = node.data?.event || "status_changed";
    } else if (module === "contact" || module === "contacts") {
      event = node.data?.event || "updated";
    } else if (module === "task" || module === "tasks") {
      event = node.data?.event || "completed";
    }

    // Registrar para debug
    console.log(
      `Converting trigger node: ${node.type} → module: ${module}, event: ${event}`
    );

    return {
      ...baseNode,
      type: "trigger",
      module,
      event,
      payloadMatch: node.data?.payloadMatch || {},
    };
  }

  // Para los nodos que no son trigger, manejamos según su tipo específico
  const type = node.type;

  switch (type) {
    case "webhook":
      return {
        ...baseNode,
        type: "http_request",
        method: node.data?.method || "POST",
        url:
          node.data?.url ||
          "https://webhook.site/8008ae11-be55-4a51-b402-92c69107bbad",
        headers: node.data?.headers || { Authorization: "Bearer 123456" },
        body: node.data?.body || {
          dealId: "{{deal._id}}",
          status: "{{status}}",
        },
      };

    case "condition":
      return {
        ...baseNode,
        type: "condition",
        conditions: [
          {
            field: node.data?.field || "contact.email",
            operator: node.data?.operator || "exists",
          },
        ],
        trueNext: nextNodes.filter((n) => n !== "false"),
        falseNext: nextNodes.filter((n) => n === "false"),
      };

    case "email":
    case "send_email": // Manejar ambos tipos de nodos por si acaso
      // Asegurar que todos los campos obligatorios estén presentes
      const emailData = {
        ...baseNode,
        type: "send_email",
        to: node.data?.to || node.data?.recipient || "{{contact.email}}",
        subject: node.data?.subject || "Email notification",
        emailBody: node.data?.emailBody || node.data?.content || "<p>Default email content</p>",
      };

      console.log("Email node complete data:", emailData);
      return emailData;

    case "mass_email":
    case "send_mass_email":
    case "massiveMail":
      // Asegurar que todos los campos obligatorios para email masivo estén presentes
      const massEmailData = {
        ...baseNode,
        type: "send_mass_email",
        listId: node.data?.listId || "",
        subject: node.data?.subject || "Mass Email Campaign",
        emailBody: node.data?.emailBody || "<p>Default mass email content</p>",
        from: node.data?.from || "",
      };

      console.log("Mass Email node complete data:", massEmailData);
      return massEmailData;

    case "whatsapp":
      return {
        ...baseNode,
        type: "send_whatsapp",
        to: node.data?.to || node.data?.recipient || "{{contact.phone}}",
        message: node.data?.message || "Default WhatsApp message",
      };

    case "contacts":
      // Obtener contactData y manejar la transformación de companyName a company
      const contactData = { ...node.data?.contactData };
      
      // Si existe companyName pero no company, actualizar
      if (contactData.companyName && !contactData.company) {
        contactData.company = contactData.companyName;
        delete contactData.companyName;
      }
      
      return {
        ...baseNode,
        type: "contacts",
        action: node.data?.action || "create",
        contactData: contactData,
      };

    case "delay":
      // Convertir la duración a un número entero
      const duration = node.data?.duration 
        ? parseInt(node.data.duration, 10)
        : 5;
        
      return {
        ...baseNode,
        type: "delay",
        delayMinutes: isNaN(duration) ? 5 : duration,
      };

    case "transform":
      return {
        ...baseNode,
        type: "transform",
        transformations: node.data?.transformations || [],
      };

    default:
      return {
        ...baseNode,
        type: type || "unknown",
        ...node.data,
      };
  }
};

// Convertir de formato API a nodos de ReactFlow
const formatNodeFromBackend = (
  apiNode: any,
  position = { x: 0, y: 0 }
): Node => {
  const baseNode = {
    id: apiNode.id,
    position,
    data: { ...apiNode },
  };

  // Eliminar propiedades que no necesitamos en el data
  delete baseNode.data.id;
  delete baseNode.data.next;
  delete baseNode.data.type;

  switch (apiNode.type) {
    case "trigger":
      // Caso especial para el trigger manual
      if (apiNode.module === "manual" && apiNode.event === "manual_execution") {
        return {
          ...baseNode,
          type: "manual_trigger",
          data: {
            ...baseNode.data,
            module: apiNode.module,
            event: apiNode.event,
            label: "Manual Trigger",
            description: apiNode.description || "Run workflow manually",
          },
        };
      }
      
      // Caso especial para webhook trigger
      if (apiNode.module === "webhook") {
        return {
          ...baseNode,
          type: "webhook_trigger",
          data: {
            ...baseNode.data,
            module: apiNode.module,
            event: apiNode.event,
            webhookId: apiNode.webhookId || "",
            webhookName: apiNode.name || "Webhook Trigger",
            webhookDescription: apiNode.description || "Recibe datos externos",
            label: "Webhook Trigger",
          },
        };
      }
      
      return {
        ...baseNode,
        type: `${apiNode.module}_trigger`,
        data: {
          ...baseNode.data,
          module: apiNode.module,
          event: apiNode.event,
          label: `${apiNode.module}: ${apiNode.event}`,
        },
      };

    case "http_request":
      return {
        ...baseNode,
        type: "webhook",
        data: {
          ...baseNode.data,
          method: apiNode.method,
          url: apiNode.url,
          headers: apiNode.headers,
          body: apiNode.body,
          label: `HTTP ${apiNode.method}`,
        },
      };

    case "condition":
      return {
        ...baseNode,
        type: "condition",
        data: {
          ...baseNode.data,
          conditions: apiNode.conditions,
          trueNext: apiNode.trueNext,
          falseNext: apiNode.falseNext,
          label: `Condition: ${apiNode.conditions?.[0]?.field || "default"}`,
        },
      };

    case "send_email":
      return {
        ...baseNode,
        type: "email",
        data: {
          ...baseNode.data,
          to: apiNode.to,
          subject: apiNode.subject,
          emailBody: apiNode.emailBody,
          label: `Email: ${apiNode.subject || "No subject"}`,
        },
      };

    case "send_mass_email":
      return {
        ...baseNode,
        type: "mass_email",
        data: {
          ...baseNode.data,
          listId: apiNode.listId,
          subject: apiNode.subject,
          emailBody: apiNode.emailBody,
          from: apiNode.from,
          label: `Mass Email: ${apiNode.subject || "No subject"}`,
        },
      };

    case "send_whatsapp":
      return {
        ...baseNode,
        type: "whatsapp",
        data: {
          ...baseNode.data,
          to: apiNode.to,
          message: apiNode.message,
          label: `WhatsApp Message`,
        },
      };

    case "contacts":
      // Si contactData tiene company pero no companyName, hacer la conversión inversa
      const contactData = { ...apiNode.contactData };
      if (contactData.company && !contactData.companyName) {
        contactData.companyName = contactData.company;
        delete contactData.company;
      }
      
      return {
        ...baseNode,
        type: "contacts",
        data: {
          ...baseNode.data,
          action: apiNode.action || "create",
          contactData,
          label: `Contact: ${apiNode.action || "create"}`,
        },
      };

    case "delay":
      return {
        ...baseNode,
        type: "delay",
        data: {
          ...baseNode.data,
          delayType: apiNode.delayType,
          duration: apiNode.delayMinutes, // Usar delayMinutes como duration
          delayMinutes: apiNode.delayMinutes,
          businessHours: apiNode.businessHours,
          label: `Delay: ${apiNode.delayMinutes} minutes`,
        },
      };

    case "transform":
      return {
        ...baseNode,
        type: "transform",
        data: {
          ...baseNode.data,
          transformations: apiNode.transformations,
          label: `Transform Data`,
        },
      };

    default:
      return {
        ...baseNode,
        type: apiNode.type,
        data: {
          ...baseNode.data,
          label: `${apiNode.type} node`,
        },
      };
  }
};

// Generar edges a partir de las conexiones en los nodos del backend
const generateEdgesFromNodes = (apiNodes: any[]): Edge[] => {
  const edges: Edge[] = [];
  let edgeId = 0;

  apiNodes.forEach((node) => {
    if (node.type === "condition") {
      // Para nodos de condición, necesitamos manejar trueNext y falseNext
      if (node.trueNext && node.trueNext.length > 0) {
        node.trueNext.forEach((targetId: string) => {
          edges.push({
            id: `edge_${++edgeId}`,
            source: node.id,
            target: targetId,
            label: "Yes",
            type: "custom",
            data: { condition: true },
          });
        });
      }
      if (node.falseNext && node.falseNext.length > 0) {
        node.falseNext.forEach((targetId: string) => {
          edges.push({
            id: `edge_${++edgeId}`,
            source: node.id,
            target: targetId,
            label: "No",
            type: "custom",
            data: { condition: false },
          });
        });
      }
    } else if (node.next && node.next.length > 0) {
      // Para nodos normales, usamos la propiedad next
      node.next.forEach((targetId: string) => {
        edges.push({
          id: `edge_${++edgeId}`,
          source: node.id,
          target: targetId,
          type: "default",
        });
      });
    }
  });

  return edges;
};

// Colocar los nodos en una distribución visual lógica
const layoutNodes = (nodes: Node[], edges: Edge[]): Node[] => {
  // Encontrar el nodo de inicio (trigger)
  const triggerNode = nodes.find(
    (node) => getNodeCategory(node.type || "") === "trigger"
  );
  if (!triggerNode) return nodes;

  // Establecer posición inicial del trigger
  triggerNode.position = { x: 250, y: 50 };

  // Map para nodos ya posicionados
  const positionedNodes = new Set<string>([triggerNode.id]);

  // Función recursiva para posicionar nodos
  const positionNodesFromSource = (
    sourceId: string,
    level: number,
    horizontalOffset = 0
  ) => {
    const childEdges = edges.filter((edge) => edge.source === sourceId);

    childEdges.forEach((edge, index) => {
      const targetNode = nodes.find((node) => node.id === edge.target);
      if (!targetNode || positionedNodes.has(targetNode.id)) return;

      // Calcular posición basada en nivel y offset
      targetNode.position = {
        x: 250 + horizontalOffset * 300, // Espaciado horizontal entre ramas
        y: 150 + level * 150, // Espaciado vertical entre niveles
      };

      positionedNodes.add(targetNode.id);

      // Posicionar los hijos de este nodo
      positionNodesFromSource(
        targetNode.id,
        level + 1,
        horizontalOffset + index * 0.5
      );
    });
  };

  // Comenzar posicionamiento desde el trigger
  positionNodesFromSource(triggerNode.id, 1, 0);

  // Manejar nodos desconectados (no deberían existir en un workflow válido)
  nodes.forEach((node) => {
    if (!positionedNodes.has(node.id)) {
      node.position = { x: 500, y: 500 };
      positionedNodes.add(node.id);
    }
  });

  return nodes;
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  ...initialState,

  setNodes: (nodes) => {
    set((state) => {
      const newNodes = Array.isArray(nodes) ? nodes : nodes(state.nodes);
      return { nodes: newNodes, error: null, hasUnsavedChanges: true };
    });
    get().addToHistory();
  },

  setEdges: (edges) => {
    set((state) => {
      const newEdges = Array.isArray(edges) ? edges : edges(state.edges);
      return { edges: newEdges, error: null, hasUnsavedChanges: true };
    });
    get().addToHistory();
  },

  toggleActive: async () => {
    const state = get();
    if (!state.validateWorkflow()) {
      return;
    }

    if (state.workflowId) {
      try {
        set({ isLoading: true, error: null });
        await automationService.toggleAutomationActive(state.workflowId);
        set((state) => ({ isActive: !state.isActive, isLoading: false }));
      } catch (error: any) {
        set({
          error: `Failed to toggle automation: ${
            error.message || "Unknown error"
          }`,
          isLoading: false,
        });
      }
    } else {
      set((state) => ({ isActive: !state.isActive }));
    }
  },

  addNode: (node) => {
    const state = get();
    const category = getNodeCategory(node.type || "");

    if (category === "trigger") {
      const existingTrigger = state.nodes.some(
        (n) => getNodeCategory(n.type || "") === "trigger"
      );
      if (existingTrigger) {
        set({ error: "Only one trigger node is allowed per workflow" });
        return false;
      }
    }

    set((state) => ({
      nodes: [...state.nodes, node],
      error: null,
      hasUnsavedChanges: true,
    }));
    get().addToHistory();
    return true;
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      error: null,
      hasUnsavedChanges: true,
    }));
    get().addToHistory();
  },

  removeEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
      error: null,
      hasUnsavedChanges: true,
    }));
    get().addToHistory();
  },

  duplicateNode: (nodeId) => {
    const state = get();
    const nodeToDuplicate = state.nodes.find((node) => node.id === nodeId);

    if (!nodeToDuplicate) return;

    const category = getNodeCategory(nodeToDuplicate.type || "");
    if (category === "trigger") {
      set({ error: "Cannot duplicate trigger nodes" });
      return;
    }

    const newNode: Node = {
      ...nodeToDuplicate,
      id: getNextNodeId(),
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
      data: { ...nodeToDuplicate.data },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      error: null,
      hasUnsavedChanges: true,
    }));
    get().addToHistory();
  },

  updateNode: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
      error: null,
      hasUnsavedChanges: true,
    }));
    get().addToHistory();
  },

  validateWorkflow: () => {
    const { nodes, edges } = get();

    const triggerCount = nodes.filter(
      (n) => getNodeCategory(n.type || "") === "trigger"
    ).length;

    if (triggerCount === 0) {
      set({ error: "Workflow must have exactly one trigger node" });
      return false;
    }

    if (triggerCount > 1) {
      set({ error: "Only one trigger node is allowed per workflow" });
      return false;
    }

    const nodesWithoutIncoming = nodes.filter(
      (node) => !edges.some((edge) => edge.target === node.id)
    );

    const invalidNodes = nodesWithoutIncoming.filter(
      (node) => getNodeCategory(node.type || "") !== "trigger"
    );

    if (invalidNodes.length > 0) {
      set({
        error:
          "All action and condition nodes must be connected to the workflow",
      });
      return false;
    }

    return true;
  },

  clearError: () => set({ error: null }),

  resetWorkflow: () => {
    set({
      ...initialState,
      isEditMode: true,
      availableNodeTypes: get().availableNodeTypes,
      availableModules: get().availableModules,
    });
    get().addToHistory();
  },

  setName: (name: string) => {
    set({ name, hasUnsavedChanges: true });
    get().addToHistory();
  },

  setDescription: (description: string) => {
    set({ description, hasUnsavedChanges: true });
    get().addToHistory();
  },

  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),

  setWorkflowId: (id: string | null) => set({ workflowId: id }),

  saveWorkflow: async () => {
    const state = get();
    if (!state.validateWorkflow()) {
      return;
    }

    const nodeConnections = state.edges.reduce((acc, edge) => {
      if (!acc[edge.source]) {
        acc[edge.source] = [];
      }
      acc[edge.source].push(edge.target);
      return acc;
    }, {} as Record<string, string[]>);

    const formattedNodes = state.nodes.map((node) => {
      const formatted = formatNodeForBackend(
        node,
        nodeConnections[node.id] || []
      );
      console.log(
        `Node ${node.id} (${node.type}) → formatted type: ${formatted.type}, module: ${formatted.module}`
      );
      return formatted;
    });

    console.log("All formatted nodes:", formattedNodes);

    const workflowData = {
      name: state.name || "Untitled Workflow",
      description: state.description || "",
      isActive: state.isActive,
      nodes: formattedNodes,
    };

    console.log("Saving workflow with data:", workflowData);

    try {
      set({ isSaving: true, error: null });
      
      const { nodes } = state;
      const updateNodeMethod = get().updateNode;
      
      // Preparar los nodos para el backend
      const webhookTriggerNodes: Node[] = [];
      
      // Buscar nodos de tipo webhook_trigger que necesiten crear webhook
      nodes.forEach(node => {
        if (node.type === 'webhook_trigger' && !node.data.webhookId) {
          webhookTriggerNodes.push(node);
        }
      });
      
      // Crear webhooks para los nodos que lo necesiten
      if (webhookTriggerNodes.length > 0) {
        for (const node of webhookTriggerNodes) {
          try {
            // Crear webhook usando webhookService
            const webhookData = {
              name: node.data.webhookName || "Webhook para creación de contactos",
              description: node.data.webhookDescription || "Recibe datos de formularios externos y crea contactos",
              module: "webhook",
              event: node.data.event || "contact_form",
              isActive: true,
              organizationId: "659d89b73c6aa865f1e7d6fb", // Debe ser dinámico en producción
              createdBy: "6594a74983de58ca5547b945"  // Debe ser dinámico en producción
            };
            
            const webhook = await webhookService.createWebhookEndpoint(webhookData);
            
            // Actualizar el nodo con el ID del webhook creado
            updateNodeMethod(node.id, { 
              webhookId: webhook.id,
              webhookUrl: `http://localhost:3001/api/v1/webhooks/id/${webhook.id}`
            });
          } catch (err) {
            const error = err as Error;
            console.error('Error creating webhook:', error);
            set({ 
              error: `Error al crear webhook: ${error.message || "Error desconocido"}`,
              isSaving: false 
            });
            return;
          }
        }
      }
      
      // Continuar con el guardado normal de la automatización
      let result;
      if (state.workflowId) {
        // Actualizar workflow existente
        result = await automationService.updateAutomation(
          state.workflowId,
          workflowData
        );
      } else {
        // Crear nuevo workflow
        result = await automationService.createAutomation(workflowData);
        // Guardar el ID del nuevo workflow
        set({ workflowId: result.id });
      }

      set({ hasUnsavedChanges: false, isSaving: false });
      return result;
    } catch (error: any) {
      set({
        error: `Failed to save workflow: ${error.message || "Unknown error"}`,
        isSaving: false,
      });
    }
  },

  loadWorkflow: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const automation = await automationService.getAutomation(id);

      // Posicionar los nodos visualmente
      const reactFlowNodes = automation.nodes.map(
        (node: any, index: number) => {
          // Posición inicial en cascada, luego se ajustará con layoutNodes
          const position = { x: 100, y: 100 + index * 100 };
          return formatNodeFromBackend(node, position);
        }
      );

      const reactFlowEdges = generateEdgesFromNodes(automation.nodes);

      // Aplicar layout automático a los nodos
      const positionedNodes = layoutNodes(reactFlowNodes, reactFlowEdges);

      set({
        nodes: positionedNodes,
        edges: reactFlowEdges,
        name: automation.name,
        description: automation.description,
        isActive: automation.status === "active",
        workflowId: id,
        isLoading: false,
        hasUnsavedChanges: false,
        history: [
          {
            nodes: positionedNodes,
            edges: reactFlowEdges,
            name: automation.name,
            description: automation.description,
          },
        ],
        currentHistoryIndex: 0,
      });
    } catch (error: any) {
      set({
        error: `Failed to load workflow: ${error.message || "Unknown error"}`,
        isLoading: false,
      });
    }
  },

  createNewWorkflow: () => {
    set({
      ...initialState,
      isEditMode: true,
      availableNodeTypes: get().availableNodeTypes,
      availableModules: get().availableModules,
      history: [],
      currentHistoryIndex: -1,
    });
    get().addToHistory();
  },

  executeWorkflow: async () => {
    const { workflowId } = get();
    if (!workflowId) {
      set({ error: "Please save the workflow before executing it" });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const result = await automationService.executeAutomation(workflowId);
      set({ isLoading: false });
      return result;
    } catch (error: any) {
      set({
        error: `Failed to execute workflow: ${
          error.message || "Unknown error"
        }`,
        isLoading: false,
      });
    }
  },

  loadNodeTypes: async () => {
    try {
      set({ isLoadingNodeTypes: true, error: null });
      const nodeTypes = await automationService.getNodeTypes();
      set({ availableNodeTypes: nodeTypes, isLoadingNodeTypes: false });
    } catch (error: any) {
      set({
        error: `Failed to load node types: ${error.message || "Unknown error"}`,
        isLoadingNodeTypes: false,
      });
    }
  },

  loadAvailableModules: async () => {
    try {
      set({ isLoadingModules: true, error: null });
      const modules = await automationService.getAvailableModules();
      set({ availableModules: modules, isLoadingModules: false });
    } catch (error: any) {
      set({
        error: `Failed to load modules: ${error.message || "Unknown error"}`,
        isLoadingModules: false,
      });
    }
  },

  simulateExecution: () => {
    const state = get();
    if (!state.validateWorkflow()) {
      return;
    }

    const { nodes, edges } = state;
    const path: string[] = [];

    const findNextNodes = (nodeId: string) => {
      path.push(nodeId);

      const connectedEdges = edges.filter((edge) => edge.source === nodeId);

      connectedEdges.forEach((edge) => {
        const nextNode = nodes.find((n) => n.id === edge.target);
        if (nextNode) {
          findNextNodes(nextNode.id);
        }
      });
    };

    const triggerNode = nodes.find(
      (node) => getNodeCategory(node.type || "") === "trigger"
    );
    if (triggerNode) {
      findNextNodes(triggerNode.id);
    }

    set({ activePath: path, error: null });
  },

  // History management
  history: [],
  currentHistoryIndex: -1,

  addToHistory: () => {
    const { nodes, edges, name, description, currentHistoryIndex, history } =
      get();

    // Remove any future history states if we're not at the latest state
    const newHistory = history.slice(0, currentHistoryIndex + 1);

    // Add the current state to history
    newHistory.push({
      nodes: [...nodes],
      edges: [...edges],
      name,
      description,
    });

    // Keep only the last 50 states to prevent memory issues
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { currentHistoryIndex, history } = get();
    if (currentHistoryIndex > 0) {
      const previousState = history[currentHistoryIndex - 1];
      set({
        nodes: previousState.nodes,
        edges: previousState.edges,
        name: previousState.name,
        description: previousState.description,
        currentHistoryIndex: currentHistoryIndex - 1,
        error: null,
        hasUnsavedChanges: true,
      });
    }
  },

  redo: () => {
    const { currentHistoryIndex, history } = get();
    if (currentHistoryIndex < history.length - 1) {
      const nextState = history[currentHistoryIndex + 1];
      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        name: nextState.name,
        description: nextState.description,
        currentHistoryIndex: currentHistoryIndex + 1,
        error: null,
        hasUnsavedChanges: true,
      });
    }
  },

  canUndo: () => {
    const { currentHistoryIndex } = get();
    return currentHistoryIndex > 0;
  },

  canRedo: () => {
    const { currentHistoryIndex, history } = get();
    return currentHistoryIndex < history.length - 1;
  },
}));
