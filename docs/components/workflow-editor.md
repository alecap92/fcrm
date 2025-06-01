# Editor de Workflows - WorkflowEditor

## 📋 Descripción

El WorkflowEditor es el componente principal para la creación y edición visual de automatizaciones. Utiliza ReactFlow para proporcionar una interfaz de drag & drop intuitiva donde los usuarios pueden crear workflows complejos conectando diferentes tipos de nodos.

## 🎯 Características Principales

### ✨ **Funcionalidades Core**

- **Drag & Drop**: Arrastrar nodos desde la sidebar al canvas
- **Conexiones Visuales**: Conectar nodos para crear flujos lógicos
- **Edición en Tiempo Real**: Cambios instantáneos con validación
- **Historial**: Sistema de undo/redo para cambios
- **Validación**: Verificación automática de conexiones válidas

### 🎨 **Interfaz de Usuario**

- **Canvas Infinito**: Área de trabajo expandible con zoom y pan
- **Sidebar de Nodos**: Catálogo de nodos disponibles organizados por categoría
- **Panel de Propiedades**: Configuración detallada de nodos seleccionados
- **Toolbar**: Herramientas de edición y navegación
- **Minimap**: Vista general del workflow para navegación rápida

## 🏗️ Arquitectura de Componentes

```
WorkflowEditor/
├── WorkflowEditor.tsx          # Componente principal
├── components/
│   ├── Canvas/
│   │   ├── WorkflowCanvas.tsx  # Canvas principal con ReactFlow
│   │   ├── NodeTypes/          # Definiciones de tipos de nodos
│   │   └── EdgeTypes/          # Definiciones de tipos de conexiones
│   ├── Sidebar/
│   │   ├── NodeSidebar.tsx     # Sidebar con nodos disponibles
│   │   ├── NodeCategory.tsx    # Categorías de nodos
│   │   └── NodeItem.tsx        # Item individual de nodo
│   ├── Properties/
│   │   ├── PropertiesPanel.tsx # Panel de propiedades
│   │   ├── NodeConfig/         # Configuradores por tipo de nodo
│   │   └── ValidationPanel.tsx # Panel de validación
│   └── Toolbar/
│       ├── EditorToolbar.tsx   # Barra de herramientas
│       ├── ZoomControls.tsx    # Controles de zoom
│       └── HistoryControls.tsx # Controles de historial
```

## 🎨 Tipos de Nodos

### 1. **Trigger Nodes (Disparadores)**

#### **Webhook Trigger**

```typescript
interface WebhookTriggerData {
  module: "webhook";
  event: string;
  webhookId?: string;
  isConfigured: boolean;
}
```

**Configuración**:

- Selección de evento webhook
- URL única generada automáticamente
- Configuración de headers y validación

#### **Schedule Trigger**

```typescript
interface ScheduleTriggerData {
  module: "schedule";
  cronExpression: string;
  timezone: string;
  isConfigured: boolean;
}
```

**Configuración**:

- Editor visual de cron expressions
- Selección de zona horaria
- Vista previa de próximas ejecuciones

### 2. **Action Nodes (Acciones)**

#### **Email Action**

```typescript
interface EmailActionData {
  to: string;
  subject: string;
  body: string;
  attachments?: string[];
  template?: string;
}
```

**Configuración**:

- Editor de plantillas con variables
- Gestión de adjuntos
- Vista previa del email

#### **WhatsApp Action**

```typescript
interface WhatsAppActionData {
  to: string;
  message: string;
  mediaUrl?: string;
  template?: string;
}
```

**Configuración**:

- Editor de mensajes con emojis
- Soporte para multimedia
- Plantillas predefinidas

#### **HTTP Request Action**

```typescript
interface HttpRequestData {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers: Record<string, string>;
  body?: string;
  timeout: number;
}
```

### 3. **Logic Nodes (Lógica)**

#### **Condition Node**

```typescript
interface ConditionData {
  condition: string;
  operator: "equals" | "contains" | "greater" | "less";
  value: any;
  trueNext: string[];
  falseNext: string[];
}
```

#### **Delay Node**

```typescript
interface DelayData {
  duration: number;
  unit: "seconds" | "minutes" | "hours" | "days";
}
```

## 🔧 Configuración y Uso

### Inicialización del Editor

```tsx
import { WorkflowEditor } from "./components/WorkflowEditor";
import { AutomationProvider } from "./contexts/AutomationContext";

function App() {
  return (
    <AutomationProvider>
      <WorkflowEditor
        workflowId="workflow-123"
        mode="edit" // 'edit' | 'view'
        onSave={(workflow) => console.log("Saved:", workflow)}
        onExecute={(workflowId) => console.log("Executing:", workflowId)}
      />
    </AutomationProvider>
  );
}
```

### Props del WorkflowEditor

```typescript
interface WorkflowEditorProps {
  workflowId?: string; // ID del workflow a cargar
  mode?: "edit" | "view"; // Modo de edición o solo vista
  initialWorkflow?: Workflow; // Workflow inicial (para nuevos)
  onSave?: (workflow: Workflow) => void;
  onExecute?: (workflowId: string) => void;
  onClose?: () => void;
  className?: string;
}
```

## 🎮 Interacciones del Usuario

### 1. **Creación de Nodos**

```typescript
// Drag desde sidebar
const onDragStart = (event: DragEvent, nodeType: string) => {
  event.dataTransfer.setData("application/reactflow", nodeType);
  event.dataTransfer.effectAllowed = "move";
};

// Drop en canvas
const onDrop = useCallback(
  (event: DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/reactflow");

    const position = project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = createNode(type, position);
    addNode(newNode);
  },
  [project, addNode]
);
```

### 2. **Conexión de Nodos**

```typescript
const onConnect = useCallback(
  (params: Connection) => {
    // Validar conexión
    if (!isValidConnection(params)) {
      showError("Conexión no válida");
      return;
    }

    // Crear edge
    const newEdge = {
      id: `${params.source}-${params.target}`,
      source: params.source,
      target: params.target,
      type: "smoothstep",
      animated: true,
    };

    setEdges((edges) => addEdge(newEdge, edges));
  },
  [setEdges]
);
```

### 3. **Selección y Edición**

```typescript
const onNodeClick = useCallback(
  (event: MouseEvent, node: Node) => {
    if (!editor.isEditMode) return;

    setSelectedNode(node.id);
    // Abrir panel de propiedades
    openPropertiesPanel(node);
  },
  [editor.isEditMode, setSelectedNode]
);
```

### 4. **Eliminación**

```typescript
// Eliminar con tecla Delete
const onKeyDown = useCallback(
  (event: KeyboardEvent) => {
    if (event.key === "Delete" && editor.selectedNodeId) {
      deleteNode(editor.selectedNodeId);
    }
  },
  [editor.selectedNodeId, deleteNode]
);

// Eliminar conexión con click
const onEdgeClick = useCallback(
  (event: MouseEvent, edge: Edge) => {
    if (editor.isEditMode) {
      setEdges((edges) => edges.filter((e) => e.id !== edge.id));
    }
  },
  [editor.isEditMode, setEdges]
);
```

## 🎨 Personalización Visual

### Estilos de Nodos

```css
/* Nodo Trigger */
.react-flow__node-trigger {
  @apply bg-blue-500 text-white rounded-lg shadow-lg;
  @apply border-2 border-blue-600;
  @apply min-w-[150px] p-3;
}

/* Nodo Action */
.react-flow__node-action {
  @apply bg-green-500 text-white rounded-lg shadow-lg;
  @apply border-2 border-green-600;
  @apply min-w-[150px] p-3;
}

/* Nodo Condition */
.react-flow__node-condition {
  @apply bg-yellow-500 text-white rounded-lg shadow-lg;
  @apply border-2 border-yellow-600;
  @apply min-w-[150px] p-3;
  @apply transform rotate-45; /* Forma de diamante */
}
```

### Estilos de Conexiones

```css
/* Edge normal */
.react-flow__edge-path {
  stroke: #64748b;
  stroke-width: 2;
}

/* Edge seleccionado */
.react-flow__edge.selected .react-flow__edge-path {
  stroke: #3b82f6;
  stroke-width: 3;
}

/* Edge animado */
.react-flow__edge.animated .react-flow__edge-path {
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}
```

## 🔍 Validación y Errores

### Validación de Conexiones

```typescript
const isValidConnection = (connection: Connection): boolean => {
  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);

  // No conectar a sí mismo
  if (connection.source === connection.target) return false;

  // Triggers solo pueden ser fuente
  if (sourceNode?.type === "trigger" && connection.sourceHandle !== "output") {
    return false;
  }

  // Validar tipos de handles
  if (connection.sourceHandle === "false" && targetNode?.type === "trigger") {
    return false;
  }

  return true;
};
```

### Validación de Workflow

```typescript
const validateWorkflow = (workflow: Workflow): ValidationResult => {
  const errors: ValidationError[] = [];

  // Debe tener al menos un trigger
  const triggers = workflow.nodes.filter((n) => n.type === "trigger");
  if (triggers.length === 0) {
    errors.push({
      type: "missing_trigger",
      message: "El workflow debe tener al menos un trigger",
    });
  }

  // Nodos sin conexiones
  const orphanNodes = workflow.nodes.filter((node) => {
    const hasIncoming = workflow.edges.some((e) => e.target === node.id);
    const hasOutgoing = workflow.edges.some((e) => e.source === node.id);
    return !hasIncoming && !hasOutgoing && node.type !== "trigger";
  });

  if (orphanNodes.length > 0) {
    errors.push({
      type: "orphan_nodes",
      message: `Nodos sin conexiones: ${orphanNodes
        .map((n) => n.data.label)
        .join(", ")}`,
    });
  }

  return { isValid: errors.length === 0, errors };
};
```

## 🚀 Optimizaciones de Rendimiento

### 1. **Memoización de Nodos**

```typescript
const styledNodes = useMemo(() => {
  return nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      isSelected: node.id === editor.selectedNodeId,
      isConfigured: isNodeConfigured(node),
    },
  }));
}, [nodes, editor.selectedNodeId]);
```

### 2. **Lazy Loading de Configuradores**

```typescript
const NodeConfigurator = lazy(
  () => import(`./NodeConfig/${nodeType}Configurator`)
);
```

### 3. **Debouncing de Cambios**

```typescript
const debouncedSave = useMemo(
  () =>
    debounce((workflow: Workflow) => {
      saveWorkflow(workflow);
    }, 1000),
  [saveWorkflow]
);
```

## 🧪 Testing

### Testing de Componentes

```typescript
describe("WorkflowEditor", () => {
  it("should create node on drop", async () => {
    render(<WorkflowEditor />);

    const sidebar = screen.getByTestId("node-sidebar");
    const canvas = screen.getByTestId("workflow-canvas");

    // Simular drag & drop
    fireEvent.dragStart(sidebar.querySelector('[data-node-type="email"]'));
    fireEvent.drop(canvas, { clientX: 100, clientY: 100 });

    expect(screen.getByText("Email Node")).toBeInTheDocument();
  });
});
```

### Testing de Validación

```typescript
describe("Workflow Validation", () => {
  it("should validate workflow correctly", () => {
    const workflow = {
      nodes: [{ id: "1", type: "trigger" }],
      edges: [],
    };

    const result = validateWorkflow(workflow);
    expect(result.isValid).toBe(true);
  });
});
```

## 📚 Recursos Adicionales

- [ReactFlow Documentation](https://reactflow.dev/)
- [Drag & Drop Improvements](./drag-drop-improvements.md)
- [Delete Functionality](./delete-functionality.md)
- [AutomationContext](../../src/contexts/README.md)

---

Esta documentación proporciona una guía completa para entender, usar y extender el WorkflowEditor de FUSIONCOL.
