import { create } from 'zustand';
import { Node, Edge } from 'reactflow';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
  name: string;
  description: string;
}

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  isActive: boolean;
  activePath: string[];
  error: string | null;
  name: string;
  description: string;
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  history: HistoryState[];
  currentHistoryIndex: number;
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  toggleActive: () => void;
  addNode: (node: Node) => boolean;
  updateNode: (nodeId: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  saveWorkflow: () => void;
  loadWorkflow: () => void;
  simulateExecution: () => void;
  validateWorkflow: () => boolean;
  clearError: () => void;
  resetWorkflow: () => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  toggleEditMode: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  addToHistory: () => void;
}

type NodeCategory = 'trigger' | 'action' | 'condition';

const getNodeCategory = (type: string): NodeCategory => {
  if (type.includes('trigger')) return 'trigger';
  if (type === 'condition') return 'condition';
  return 'action';
};

let nodeIdCounter = 0;
const getNextNodeId = () => `node_${++nodeIdCounter}`;

const initialState = {
  nodes: [],
  edges: [],
  isActive: false,
  activePath: [],
  error: null,
  name: 'Untitled Workflow',
  description: '',
  isEditMode: false,
  hasUnsavedChanges: false,
  history: [],
  currentHistoryIndex: -1,
};

const formatNodeForBackend = (node: Node, nextNodes: string[]) => {
  const baseNode = {
    id: node.id,
    next: nextNodes,
  };

  // Extract the base type without the specific trigger type
  const type = node.type?.replace(/_trigger$/, '');

  switch (type) {
    case 'deal':
      return {
        ...baseNode,
        type: 'trigger',
        module: 'deals',
        event: 'status_changed',
        payloadMatch: {
          fromStatus: { $oid: node.data?.fromStatus || "66c6370ad573dacc51e620f4" },
          toStatus: { $oid: node.data?.toStatus || "66c6370ad573dacc51e620f5" }
        }
      };

    case 'webhook':
      return {
        ...baseNode,
        type: 'http_request',
        method: node.data?.method || 'POST',
        url: node.data?.url || 'https://webhook.site/8008ae11-be55-4a51-b402-92c69107bbad',
        headers: node.data?.headers || { Authorization: 'Bearer 123456' },
        body: node.data?.body || { dealId: '{{deal._id}}', status: '{{status}}' }
      };

    case 'condition':
      return {
        ...baseNode,
        type: 'condition',
        conditions: [
          {
            field: node.data?.field || 'contact.email',
            operator: node.data?.operator || 'exists'
          }
        ],
        trueNext: nextNodes.filter(n => n !== 'false'),
        falseNext: nextNodes.filter(n => n === 'false')
      };

    case 'email':
      return {
        ...baseNode,
        type: 'send_email',
        to: node.data?.to || '{{contact.email}}',
        subject: node.data?.subject || 'Email notification',
        emailBody: node.data?.emailBody || '<p>Default email content</p>'
      };

    case 'datetime':
      return {
        ...baseNode,
        type: 'datetime',
        actionType: node.data?.actionType || 'delay',
        date: node.data?.date,
        businessHours: node.data?.businessHours,
        workingDays: node.data?.workingDays
      };

    default:
      return {
        ...baseNode,
        type: type || 'unknown',
        ...node.data
      };
  }
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

  toggleActive: () => {
    const state = get();
    if (!state.validateWorkflow()) {
      return;
    }
    set((state) => ({ isActive: !state.isActive }));
  },

  addNode: (node) => {
    const state = get();
    const category = getNodeCategory(node.type);
    
    if (category === 'trigger') {
      const existingTrigger = state.nodes.some(n => getNodeCategory(n.type) === 'trigger');
      if (existingTrigger) {
        set({ error: 'Only one trigger node is allowed per workflow' });
        return false;
      }
    }

    set((state) => ({ 
      nodes: [...state.nodes, node],
      error: null,
      hasUnsavedChanges: true
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
      hasUnsavedChanges: true
    }));
    get().addToHistory();
  },

  removeEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
      error: null,
      hasUnsavedChanges: true
    }));
    get().addToHistory();
  },

  duplicateNode: (nodeId) => {
    const state = get();
    const nodeToDuplicate = state.nodes.find((node) => node.id === nodeId);
    
    if (!nodeToDuplicate) return;

    const category = getNodeCategory(nodeToDuplicate.type);
    if (category === 'trigger') {
      set({ error: 'Cannot duplicate trigger nodes' });
      return;
    }

    const newNode: Node = {
      ...nodeToDuplicate,
      id: getNextNodeId(),
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50
      },
      data: { ...nodeToDuplicate.data }
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      error: null,
      hasUnsavedChanges: true
    }));
    get().addToHistory();
  },

  updateNode: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
      error: null,
      hasUnsavedChanges: true
    }));
    get().addToHistory();
  },

  validateWorkflow: () => {
    const { nodes, edges } = get();
    
    const triggerCount = nodes.filter(n => getNodeCategory(n.type) === 'trigger').length;
    
    if (triggerCount === 0) {
      set({ error: 'Workflow must have exactly one trigger node' });
      return false;
    }
    
    if (triggerCount > 1) {
      set({ error: 'Only one trigger node is allowed per workflow' });
      return false;
    }
    
    const nodesWithoutIncoming = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );
    
    const invalidNodes = nodesWithoutIncoming.filter(node => 
      getNodeCategory(node.type) !== 'trigger'
    );
    
    if (invalidNodes.length > 0) {
      set({ error: 'All action and condition nodes must be connected to the workflow' });
      return false;
    }
    
    return true;
  },

  clearError: () => set({ error: null }),

  resetWorkflow: () => {
    set({ ...initialState, isEditMode: true });
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

  saveWorkflow: () => {
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

    const formattedNodes = state.nodes.map(node => 
      formatNodeForBackend(node, nodeConnections[node.id] || [])
    );

    const workflowData = {
      _id: { $oid: "67e2fc3f32c74eac4c161517" },
      name: state.name,
      description: state.description,
      isActive: state.isActive,
      createdBy: { $oid: "6594a74983de58ca5547b945" },
      organizationId: { $oid: "659d89b73c6aa865f1e7d6fb" },
      nodes: formattedNodes,
      createdAt: { $date: new Date().toISOString() },
      updatedAt: { $date: new Date().toISOString() }
    };

    console.log('Workflow data for backend:', JSON.stringify(workflowData, null, 2));
    localStorage.setItem('workflow', JSON.stringify({ 
      nodes: state.nodes, 
      edges: state.edges, 
      isActive: state.isActive,
      name: state.name,
      description: state.description
    }));
    
    set({ hasUnsavedChanges: false });
  },

  loadWorkflow: () => {
    const saved = localStorage.getItem('workflow');
    if (saved) {
      const { nodes, edges, isActive, name, description } = JSON.parse(saved);
      set({ 
        nodes, 
        edges, 
        isActive, 
        name: name || 'Untitled Workflow',
        description: description || '',
        error: null,
        history: [{ nodes, edges, name: name || 'Untitled Workflow', description: description || '' }],
        currentHistoryIndex: 0,
        hasUnsavedChanges: false
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
      
      const connectedEdges = edges.filter(edge => edge.source === nodeId);
      
      connectedEdges.forEach(edge => {
        const nextNode = nodes.find(n => n.id === edge.target);
        if (nextNode) {
          findNextNodes(nextNode.id);
        }
      });
    };
    
    const triggerNode = nodes.find(node => getNodeCategory(node.type) === 'trigger');
    if (triggerNode) {
      findNextNodes(triggerNode.id);
    }
    
    set({ activePath: path, error: null });
  },

  // History management
  history: [],
  currentHistoryIndex: -1,

  addToHistory: () => {
    const { nodes, edges, name, description, currentHistoryIndex, history } = get();
    
    // Remove any future history states if we're not at the latest state
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    
    // Add the current state to history
    newHistory.push({ nodes: [...nodes], edges: [...edges], name, description });
    
    // Keep only the last 50 states to prevent memory issues
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
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
        hasUnsavedChanges: true
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
        hasUnsavedChanges: true
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
  }
}));