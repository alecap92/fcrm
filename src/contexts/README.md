# Contexto de Automatizaciones - Documentación

## Descripción General

El `AutomationContext` es un contexto de React optimizado que centraliza toda la lógica de gestión de automatizaciones y workflows. Utiliza `useReducer` para un manejo eficiente del estado y proporciona una API limpia para todas las operaciones relacionadas con automatizaciones.

## Características Principales

### 🎯 **Gestión Centralizada del Estado**

- Estado unificado para workflows, automatizaciones y editor
- Reducer pattern para actualizaciones predecibles
- Manejo automático de estados de carga y errores

### 🔄 **Operaciones CRUD Completas**

- Crear, leer, actualizar y eliminar automatizaciones
- Gestión de nodos y conexiones en tiempo real
- Validaciones automáticas

### 📝 **Sistema de Historial**

- Undo/Redo para cambios en el editor
- Historial limitado a 50 estados para optimización
- Navegación fluida entre estados

### 🎨 **Integración con ReactFlow**

- Manejo nativo de nodos y edges
- Drag & drop optimizado
- Validaciones de conexiones

## Estructura del Estado

```typescript
interface AutomationState {
  // Workflow actual en edición
  currentWorkflow: {
    id: string | null;
    name: string;
    description: string;
    nodes: Node[];
    edges: Edge[];
    isActive: boolean;
  };

  // Lista de todas las automatizaciones
  automations: Automation[];

  // Estados de carga granulares
  loading: {
    workflows: boolean;
    saving: boolean;
    executing: boolean;
    deleting: boolean;
  };

  // Catálogos de tipos disponibles
  catalogs: {
    nodeTypes: NodeType[];
    modules: ModuleEvent[];
    isLoadingNodeTypes: boolean;
    isLoadingModules: boolean;
  };

  // Estado del editor visual
  editor: {
    isEditMode: boolean;
    hasUnsavedChanges: boolean;
    selectedNodeId: string | null;
    activePath: string[];
    history: HistoryState[];
    currentHistoryIndex: number;
  };

  // Manejo de errores
  error: string | null;
}
```

## Uso Básico

### 1. **Configuración del Provider**

```tsx
import { AutomationProvider } from "../contexts/AutomationContext";

function App() {
  return <AutomationProvider>{/* Tu aplicación */}</AutomationProvider>;
}
```

### 2. **Uso en Componentes**

```tsx
import { useAutomation } from "../contexts/AutomationContext";

function MyComponent() {
  const {
    state,
    loadAutomations,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    // ... más métodos
  } = useAutomation();

  const { automations, loading, error } = state;

  useEffect(() => {
    loadAutomations();
  }, [loadAutomations]);

  return (
    <div>
      {loading.workflows && <div>Cargando...</div>}
      {error && <div>Error: {error}</div>}
      {automations.map((automation) => (
        <div key={automation.id}>{automation.name}</div>
      ))}
    </div>
  );
}
```

## API del Contexto

### **Operaciones de Automatizaciones**

#### `loadAutomations(filters?: any): Promise<void>`

Carga la lista de automatizaciones con filtros opcionales.

```tsx
// Cargar todas las automatizaciones
await loadAutomations();

// Cargar con filtros
await loadAutomations({ status: "active", search: "email" });
```

#### `createAutomation(data: Partial<Automation>): Promise<Automation>`

Crea una nueva automatización.

```tsx
const newAutomation = await createAutomation({
  name: "Mi Nueva Automatización",
  description: "Descripción de la automatización",
  nodes: [],
  status: "inactive",
});
```

#### `updateAutomation(id: string, data: Partial<Automation>): Promise<Automation>`

Actualiza una automatización existente.

```tsx
const updated = await updateAutomation("automation-id", {
  name: "Nombre Actualizado",
  status: "active",
});
```

#### `deleteAutomation(id: string): Promise<void>`

Elimina una automatización.

```tsx
await deleteAutomation("automation-id");
```

#### `toggleAutomationActive(id: string): Promise<void>`

Alterna el estado activo/inactivo de una automatización.

```tsx
await toggleAutomationActive("automation-id");
```

#### `executeAutomation(id: string): Promise<void>`

Ejecuta manualmente una automatización.

```tsx
await executeAutomation("automation-id");
```

### **Operaciones del Workflow Actual**

#### `loadWorkflow(id: string): Promise<void>`

Carga un workflow específico para edición.

```tsx
await loadWorkflow("workflow-id");
```

#### `saveCurrentWorkflow(): Promise<void>`

Guarda el workflow actual.

```tsx
await saveCurrentWorkflow();
```

#### `createNewWorkflow(): void`

Inicializa un nuevo workflow en modo edición.

```tsx
createNewWorkflow();
```

#### `resetWorkflow(): void`

Resetea el workflow actual.

```tsx
resetWorkflow();
```

### **Operaciones de Nodos y Edges**

#### `setNodes(nodes: Node[] | ((nodes: Node[]) => Node[])): void`

Actualiza los nodos del workflow.

```tsx
// Establecer nodos directamente
setNodes([newNode1, newNode2]);

// Actualizar usando función
setNodes((currentNodes) => [...currentNodes, newNode]);
```

#### `setEdges(edges: Edge[] | ((edges: Edge[]) => Edge[])): void`

Actualiza las conexiones del workflow.

```tsx
setEdges((currentEdges) => [...currentEdges, newEdge]);
```

#### `addNode(node: Node): boolean`

Agrega un nuevo nodo con validaciones.

```tsx
const success = addNode({
  id: "node-1",
  type: "email",
  position: { x: 100, y: 100 },
  data: { label: "Send Email" },
});
```

#### `updateNode(id: string, data: any): void`

Actualiza los datos de un nodo específico.

```tsx
updateNode("node-1", {
  to: "user@example.com",
  subject: "Nuevo asunto",
});
```

#### `deleteNode(id: string): void`

Elimina un nodo y sus conexiones.

```tsx
deleteNode("node-1");
```

#### `duplicateNode(id: string): void`

Duplica un nodo existente.

```tsx
duplicateNode("node-1");
```

#### `onConnect(connection: Connection): void`

Maneja nuevas conexiones entre nodos.

```tsx
// Se usa automáticamente en ReactFlow
<ReactFlow onConnect={onConnect} />
```

### **Operaciones del Editor**

#### `toggleEditMode(): void`

Alterna entre modo vista y edición.

```tsx
toggleEditMode();
```

#### `setWorkflowName(name: string): void`

Actualiza el nombre del workflow.

```tsx
setWorkflowName("Nuevo Nombre");
```

#### `setWorkflowDescription(description: string): void`

Actualiza la descripción del workflow.

```tsx
setWorkflowDescription("Nueva descripción");
```

### **Sistema de Historial**

#### `undo(): void`

Deshace el último cambio.

```tsx
undo();
```

#### `redo(): void`

Rehace el último cambio deshecho.

```tsx
redo();
```

#### `canUndo(): boolean`

Verifica si se puede deshacer.

```tsx
const canUndoAction = canUndo();
```

#### `canRedo(): boolean`

Verifica si se puede rehacer.

```tsx
const canRedoAction = canRedo();
```

#### `addToHistory(): void`

Agrega el estado actual al historial (se llama automáticamente).

```tsx
addToHistory();
```

### **Catálogos**

#### `loadNodeTypes(): Promise<void>`

Carga los tipos de nodos disponibles.

```tsx
await loadNodeTypes();
```

#### `loadModules(): Promise<void>`

Carga los módulos disponibles.

```tsx
await loadModules();
```

### **Utilidades**

#### `clearError(): void`

Limpia el error actual.

```tsx
clearError();
```

#### `validateWorkflow(): boolean`

Valida el workflow actual.

```tsx
const isValid = validateWorkflow();
```

## Ejemplos de Uso

### **Página de Lista de Automatizaciones**

```tsx
function AutomationsList() {
  const { state, loadAutomations, deleteAutomation, toggleAutomationActive } =
    useAutomation();
  const { automations, loading, error } = state;

  useEffect(() => {
    loadAutomations();
  }, [loadAutomations]);

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar automatización?")) {
      await deleteAutomation(id);
    }
  };

  const handleToggle = async (id: string) => {
    await toggleAutomationActive(id);
  };

  if (loading.workflows) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {automations.map((automation) => (
        <div key={automation.id}>
          <h3>{automation.name}</h3>
          <button onClick={() => handleToggle(automation.id)}>
            {automation.status === "active" ? "Desactivar" : "Activar"}
          </button>
          <button onClick={() => handleDelete(automation.id)}>Eliminar</button>
        </div>
      ))}
    </div>
  );
}
```

### **Editor de Workflow**

```tsx
function WorkflowEditor() {
  const { id } = useParams();
  const {
    state,
    loadWorkflow,
    createNewWorkflow,
    saveCurrentWorkflow,
    setNodes,
    setEdges,
    addNode,
    onConnect,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useAutomation();

  const { currentWorkflow, editor, loading } = state;

  useEffect(() => {
    if (id === "new") {
      createNewWorkflow();
    } else if (id) {
      loadWorkflow(id);
    }
  }, [id, loadWorkflow, createNewWorkflow]);

  const handleSave = async () => {
    await saveCurrentWorkflow();
  };

  const handleDrop = (event: DragEvent) => {
    const nodeType = event.dataTransfer.getData("application/reactflow");
    const position = { x: event.clientX, y: event.clientY };

    addNode({
      id: `node-${Date.now()}`,
      type: nodeType,
      position,
      data: {},
    });
  };

  return (
    <div>
      <div>
        <h1>{currentWorkflow.name}</h1>
        <button onClick={undo} disabled={!canUndo()}>
          Deshacer
        </button>
        <button onClick={redo} disabled={!canRedo()}>
          Rehacer
        </button>
        <button onClick={handleSave} disabled={loading.saving}>
          {loading.saving ? "Guardando..." : "Guardar"}
        </button>
      </div>

      <ReactFlow
        nodes={currentWorkflow.nodes}
        edges={currentWorkflow.edges}
        onConnect={onConnect}
        onDrop={handleDrop}
        nodesDraggable={editor.isEditMode}
        nodesConnectable={editor.isEditMode}
      />
    </div>
  );
}
```

## Ventajas del Nuevo Contexto

### ✅ **Código Más Limpio**

- Eliminación de lógica duplicada
- Separación clara de responsabilidades
- Componentes más enfocados en la UI

### ✅ **Mejor Performance**

- Actualizaciones granulares del estado
- Memoización automática de callbacks
- Reducción de re-renders innecesarios

### ✅ **Manejo de Errores Mejorado**

- Gestión centralizada de errores
- Notificaciones automáticas
- Recovery automático

### ✅ **Escalabilidad**

- Fácil agregar nuevas funcionalidades
- Estado predecible y testeable
- Arquitectura modular

### ✅ **Developer Experience**

- TypeScript completo
- API intuitiva
- Documentación integrada

## Migración desde el Store Anterior

Para migrar del `useWorkflowStore` al nuevo contexto:

1. **Reemplazar el provider**:

```tsx
// Antes
import { useWorkflowStore } from "../store/workflow";

// Después
import { useAutomation } from "../contexts/AutomationContext";
```

2. **Actualizar el uso del estado**:

```tsx
// Antes
const { nodes, edges, setNodes, setEdges } = useWorkflowStore();

// Después
const { state, setNodes, setEdges } = useAutomation();
const { currentWorkflow } = state;
const { nodes, edges } = currentWorkflow;
```

3. **Actualizar operaciones**:

```tsx
// Antes
const saveWorkflow = useWorkflowStore((state) => state.saveWorkflow);

// Después
const { saveCurrentWorkflow } = useAutomation();
```

## Consideraciones de Performance

- El contexto utiliza `useCallback` para todas las funciones
- El estado se actualiza de forma granular
- El historial está limitado a 50 estados
- Las validaciones se ejecutan solo cuando es necesario

## Testing

```tsx
import { render } from "@testing-library/react";
import { AutomationProvider } from "../contexts/AutomationContext";

function renderWithAutomationContext(component: React.ReactElement) {
  return render(<AutomationProvider>{component}</AutomationProvider>);
}
```

Este contexto optimizado proporciona una base sólida y escalable para el sistema de automatizaciones, mejorando significativamente la mantenibilidad y performance del código.
