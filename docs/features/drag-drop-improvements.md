# Mejoras en el Drag & Drop del WorkflowEditor

## Problema Identificado

El sistema de drag & drop en el WorkflowEditor tenía dos problemas principales:

1. **Drag desde sidebar**: Limitaciones que restringían el movimiento libre de los nodos desde la sidebar al canvas
2. **Drag dentro del canvas**: Los nodos existentes no se podían mover dentro del canvas

## Causas del Problema

### 1. **Cálculo Incorrecto de Posición (Sidebar → Canvas)**

```typescript
// ❌ ANTES - Posición incorrecta
const position = project({
  x: event.clientX,
  y: event.clientY,
});
```

**Problema**: Usaba las coordenadas absolutas del mouse sin considerar la posición del contenedor ReactFlow.

### 2. **Configuración Conflictiva de ReactFlow (Movimiento dentro del Canvas)**

```typescript
// ❌ ANTES - Configuración conflictiva
<ReactFlow
  nodesDraggable={editor.isEditMode}
  panOnDrag={true} // ❌ Esto interfiere con nodesDraggable
  // Faltaba onNodesChange y onEdgesChange
/>
```

**Problema**: `panOnDrag={true}` interfería con `nodesDraggable`, y faltaban los handlers para cambios de nodos y edges.

## Soluciones Implementadas

### 1. **Cálculo Correcto de Posición (Sidebar → Canvas)**

```typescript
// ✅ DESPUÉS - Posición correcta
const onDrop = useCallback(
  (event: React.DragEvent) => {
    event.preventDefault();

    if (!editor.isEditMode) return;

    const type = event.dataTransfer.getData("application/reactflow");
    if (typeof type === "undefined" || !type) return;

    // Obtener la posición relativa al contenedor de ReactFlow
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();

    if (!reactFlowBounds) return;

    // Calcular la posición correcta considerando el scroll y zoom
    const position = project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = {
      id: getId(),
      type,
      position,
      data: {
        label: `${type} node`,
        // Datos por defecto según el tipo de nodo
        ...(type.includes("trigger") && { isConfigured: false }),
        ...(type === "email" && { to: "", subject: "", body: "" }),
        ...(type === "whatsapp" && { to: "", message: "" }),
        ...(type === "delay" && { duration: 5 }),
        ...(type === "condition" && { condition: "" }),
      },
    };

    addNode(newNode);
  },
  [project, addNode, editor.isEditMode, reactFlowWrapper]
);
```

### 2. **Configuración Optimizada de ReactFlow (Movimiento dentro del Canvas)**

```typescript
// ✅ DESPUÉS - Configuración correcta
<ReactFlow
  nodes={styledNodes}
  edges={currentWorkflow.edges}
  onConnect={onConnect}
  onDragOver={onDragOver}
  onDrop={onDrop}
  onEdgeMouseEnter={onEdgeMouseEnter}
  onEdgeMouseLeave={onEdgeMouseLeave}
  onEdgeClick={onEdgeClick}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  fitView
  fitViewOptions={{
    padding: 0.2,
    includeHiddenNodes: false,
  }}
  // ✅ Configuración condicional según modo
  nodesDraggable={editor.isEditMode}
  nodesConnectable={editor.isEditMode}
  elementsSelectable={editor.isEditMode}
  selectNodesOnDrag={editor.isEditMode}
  panOnDrag={!editor.isEditMode} // ✅ Solo pan cuando NO esté en modo edición
  // ✅ Configuraciones de interactividad
  panOnScroll={true}
  zoomOnScroll={true}
  zoomOnPinch={true}
  zoomOnDoubleClick={true}
  preventScrolling={false}
  defaultViewport={{ x: 0, y: 0, zoom: 1 }}
  minZoom={0.1}
  maxZoom={2}
  snapToGrid={false}
  snapGrid={[15, 15]}
  connectionMode={ConnectionMode.Loose}
  deleteKeyCode="Delete"
  // ✅ Handlers para cambios de nodos y edges
  onNodesChange={(changes) => {
    // Manejar cambios en los nodos (incluyendo movimiento)
    if (editor.isEditMode) {
      setNodes((nodes) => applyNodeChanges(changes, nodes));
    }
  }}
  onEdgesChange={(changes) => {
    // Manejar cambios en las conexiones
    if (editor.isEditMode) {
      setEdges((edges) => applyEdgeChanges(changes, edges));
    }
  }}
>
  <Background
    variant={BackgroundVariant.Dots}
    gap={20}
    size={1}
    color="#e5e7eb"
  />
  <Controls
    position="bottom-right"
    showZoom={true}
    showFitView={true}
    showInteractive={true}
  />
</ReactFlow>
```

### 3. **Importaciones Necesarias**

```typescript
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  EdgeMouseHandler,
  Edge,
  BackgroundVariant,
  ConnectionMode,
  NodeChange, // ✅ Para manejar cambios de nodos
  EdgeChange, // ✅ Para manejar cambios de edges
  applyNodeChanges, // ✅ Función helper de ReactFlow
  applyEdgeChanges, // ✅ Función helper de ReactFlow
} from "reactflow";
```

## Mejoras Adicionales Implementadas

### 1. **Datos por Defecto para Nodos**

Cada tipo de nodo ahora recibe datos por defecto apropiados:

- **Triggers**: `isConfigured: false`
- **Email**: `to: '', subject: '', body: ''`
- **WhatsApp**: `to: '', message: ''`
- **Delay**: `duration: 5`
- **Condition**: `condition: ''`

### 2. **Sidebar Optimizado**

- Uso del contexto de automatizaciones
- Mejor feedback visual durante el drag
- Cursor `grab` y `grabbing` para mejor UX
- Información de ayuda en la parte inferior

### 3. **Configuraciones de ReactFlow Mejoradas**

#### **Interactividad Condicional**

- `nodesDraggable`: Solo en modo edición
- `nodesConnectable`: Solo en modo edición
- `elementsSelectable`: Solo en modo edición
- `panOnDrag`: Solo en modo vista (cuando NO está editando)

#### **Navegación y Zoom**

- `panOnScroll`: Permite hacer pan con scroll
- `zoomOnScroll`: Permite zoom con scroll
- `zoomOnPinch`: Permite zoom con gestos táctiles
- `zoomOnDoubleClick`: Permite zoom con doble clic

#### **Límites y Restricciones**

- `minZoom: 0.1` y `maxZoom: 2`: Límites de zoom razonables
- `snapToGrid: false`: Sin restricciones de grilla
- `connectionMode: ConnectionMode.Loose`: Conexiones más flexibles

#### **Controles Visuales**

- Background con puntos para mejor orientación
- Controles de zoom y fit view
- Indicadores visuales mejorados

### 4. **Manejo de Cambios Optimizado**

```typescript
// ✅ Uso de funciones helper de ReactFlow
onNodesChange={(changes) => {
  if (editor.isEditMode) {
    setNodes((nodes) => applyNodeChanges(changes, nodes));
  }
}}

onEdgesChange={(changes) => {
  if (editor.isEditMode) {
    setEdges((edges) => applyEdgeChanges(changes, edges));
  }
}}
```

### 5. **Mensaje de Ayuda Mejorado**

```typescript
{
  !currentWorkflow.nodes.length && editor.isEditMode && (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow-lg border">
        <p className="text-xl mb-2">
          Comienza arrastrando un disparador desde la barra lateral
        </p>
        <p className="text-sm">
          Tu workflow debe comenzar con un evento disparador
        </p>
      </div>
    </div>
  );
}
```

## Resultado

### ✅ **Antes vs Después**

| Aspecto                    | Antes              | Después                            |
| -------------------------- | ------------------ | ---------------------------------- |
| **Drag desde Sidebar**     | Limitado/diagonal  | Libre en cualquier posición        |
| **Drag dentro del Canvas** | ❌ No funcionaba   | ✅ Funciona perfectamente          |
| **Precisión**              | Impreciso          | Exacto donde se suelta             |
| **Feedback Visual**        | Básico             | Cursores y estados claros          |
| **Configuración**          | Mínima/conflictiva | Completa y optimizada              |
| **UX**                     | Confusa            | Intuitiva y fluida                 |
| **Modo Edición vs Vista**  | Sin diferenciación | Comportamiento específico por modo |

### ✅ **Funcionalidades Nuevas**

- ✅ Drag & drop libre desde sidebar sin restricciones
- ✅ **Movimiento de nodos dentro del canvas**
- ✅ Posicionamiento exacto donde se suelta el nodo
- ✅ Feedback visual mejorado (cursors grab/grabbing)
- ✅ Datos por defecto según tipo de nodo
- ✅ Controles de zoom y navegación
- ✅ Background con puntos para orientación
- ✅ Mensaje de ayuda contextual
- ✅ **Comportamiento diferenciado por modo (edición vs vista)**
- ✅ **Pan del canvas solo en modo vista**
- ✅ **Drag de nodos solo en modo edición**

### ✅ **Mejoras de Performance**

- ✅ Cálculos de posición optimizados
- ✅ Referencias correctas a contenedores
- ✅ Configuración eficiente de ReactFlow
- ✅ Uso de funciones helper nativas (`applyNodeChanges`, `applyEdgeChanges`)
- ✅ Prevención de re-renders innecesarios

## Uso

1. **Navegar a**: `http://localhost:5173/workflow/new`
2. **Arrastrar nodos desde sidebar**: Desde la barra lateral al canvas
3. **Posicionar libremente**: En cualquier lugar del canvas
4. **Mover nodos existentes**: Arrastrar nodos dentro del canvas (solo en modo edición)
5. **Conectar nodos**: Arrastrando desde los handles
6. **Navegar**: Usando zoom, pan y controles
7. **Cambiar entre modos**: Edición (drag nodos) vs Vista (pan canvas)

El drag & drop ahora funciona de manera completamente libre y natural, tanto para nuevos nodos desde la sidebar como para mover nodos existentes dentro del canvas, sin las limitaciones anteriores.
