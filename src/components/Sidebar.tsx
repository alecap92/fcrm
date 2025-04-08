import React, { useState } from "react";
import { useWorkflowStore } from "../store/workflow";
import {
  Search,
  Zap,
  MessageSquare,
  Clock,
  BarChart2,
  Mail,
  Activity,
  Filter,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Input } from "./ui/input";

interface NodeItemProps {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

// Mapeo de íconos por tipo de nodo
const getNodeIcon = (type: string) => {
  switch (type) {
    case "trigger":
      return <Zap className="w-4 h-4" />;
    case "deals_trigger":
    case "contacts_trigger":
    case "tasks_trigger":
      return <Zap className="w-4 h-4" />;
    case "webhook":
    case "http_request":
      return <Activity className="w-4 h-4" />;
    case "condition":
      return <Filter className="w-4 h-4" />;
    case "email":
    case "send_email":
      return <Mail className="w-4 h-4" />;
    case "whatsapp":
    case "send_whatsapp":
      return <MessageSquare className="w-4 h-4" />;
    case "delay":
      return <Clock className="w-4 h-4" />;
    case "transform":
      return <RefreshCw className="w-4 h-4" />;
    default:
      return <BarChart2 className="w-4 h-4" />;
  }
};

const NodeItem: React.FC<NodeItemProps> = ({
  type,
  label,
  description,
  icon,
  category,
}) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "trigger":
        return "bg-violet-100 text-violet-800";
      case "action":
        return "bg-emerald-100 text-emerald-800";
      case "condition":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className="border rounded-md p-3 mb-2 cursor-grab hover:shadow-md transition-shadow bg-white"
      onDragStart={(e) => onDragStart(e, type)}
      draggable
    >
      <div className="flex items-start mb-1">
        <div className="p-1.5 rounded mr-2 bg-gray-100">{icon}</div>
        <div>
          <div className="font-medium">{label}</div>
          <div className="text-xs text-gray-500 mt-0.5">{description}</div>
        </div>
      </div>
      <div className="mt-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(
            category
          )}`}
        >
          {category}
        </span>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const {
    availableNodeTypes,
    isLoadingNodeTypes,
    availableModules,
    isLoadingModules,
  } = useWorkflowStore();

  // Convertir tipos de nodos de la API al formato que necesitamos para mostrar
  const getNodeItems = (): NodeItemProps[] => {
    // Si aún estamos cargando, mostrar algunos nodos estándar
    if (isLoadingNodeTypes || availableNodeTypes.length === 0) {
      // Nodos predeterminados mientras cargamos
      return [
        {
          type: "deals_trigger",
          label: "Deal Trigger",
          description: "Start when deal status changes",
          icon: getNodeIcon("deals_trigger"),
          category: "Trigger",
        },
        {
          type: "webhook",
          label: "HTTP Request",
          description: "Make HTTP request to external service",
          icon: getNodeIcon("webhook"),
          category: "Action",
        },
        {
          type: "condition",
          label: "Condition",
          description: "Branch workflow based on conditions",
          icon: getNodeIcon("condition"),
          category: "Condition",
        },
        {
          type: "email",
          label: "Send Email",
          description: "Send email notification",
          icon: getNodeIcon("email"),
          category: "Action",
        },
        {
          type: "whatsapp",
          label: "Send WhatsApp",
          description: "Send WhatsApp message",
          icon: getNodeIcon("whatsapp"),
          category: "Action",
        },
        {
          type: "delay",
          label: "Delay",
          description: "Wait for specified time",
          icon: getNodeIcon("delay"),
          category: "Action",
        },
        {
          type: "transform",
          label: "Transform Data",
          description: "Modify data between steps",
          icon: getNodeIcon("transform"),
          category: "Action",
        },
      ];
    }

    // Convertir desde los tipos de nodos de la API
    return availableNodeTypes.map((nodeType) => ({
      type: nodeType.type,
      label: nodeType.label,
      description: nodeType.description,
      icon: getNodeIcon(nodeType.type),
      category: nodeType.category,
    }));
  };

  // Obtener módulos y eventos para nodos tipo trigger
  const getTriggerNodes = (): NodeItemProps[] => {
    if (isLoadingModules || availableModules.length === 0) {
      return [];
    }

    return availableModules.map((moduleEvent) => ({
      type: `${moduleEvent.module}_trigger`,
      label: `${moduleEvent.module}: ${moduleEvent.event}`,
      description: moduleEvent.description,
      icon: getNodeIcon("trigger"),
      category: "Trigger",
    }));
  };

  // Combinar todos los nodos
  const allNodes = [...getNodeItems()];

  // Filtrar nodos según búsqueda y categoría
  const filteredNodes = allNodes.filter((node) => {
    const matchesSearch =
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "all" || node.category.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Agrupar nodos por categoría
  const groupedNodes: Record<string, NodeItemProps[]> = filteredNodes.reduce(
    (acc, node) => {
      const category = node.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(node);
      return acc;
    },
    {} as Record<string, NodeItemProps[]>
  );

  // Orden de las categorías
  const categoryOrder = ["Trigger", "Condition", "Action"];
  const sortedCategories = Object.keys(groupedNodes).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  return (
    <div className="w-64 border-r bg-gray-50 flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <h2 className="font-semibold mb-4">Available Nodes</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search nodes..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex mt-3 space-x-2">
          <button
            className={`text-xs px-2 py-1 rounded-full ${
              filter === "all" ? "bg-gray-200" : "bg-gray-100"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`text-xs px-2 py-1 rounded-full ${
              filter === "trigger"
                ? "bg-violet-200 text-violet-800"
                : "bg-violet-50 text-violet-600"
            }`}
            onClick={() => setFilter("trigger")}
          >
            Triggers
          </button>
          <button
            className={`text-xs px-2 py-1 rounded-full ${
              filter === "action"
                ? "bg-emerald-200 text-emerald-800"
                : "bg-emerald-50 text-emerald-600"
            }`}
            onClick={() => setFilter("action")}
          >
            Actions
          </button>
          <button
            className={`text-xs px-2 py-1 rounded-full ${
              filter === "condition"
                ? "bg-amber-200 text-amber-800"
                : "bg-amber-50 text-amber-600"
            }`}
            onClick={() => setFilter("condition")}
          >
            Conditions
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingNodeTypes || isLoadingModules ? (
          <div className="flex flex-col items-center justify-center h-32">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-500">Loading available nodes...</p>
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No nodes found matching your search
          </div>
        ) : (
          sortedCategories.map((category) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-semibold mb-2 text-gray-600">
                {category}
              </h3>
              {groupedNodes[category].map((node, index) => (
                <NodeItem
                  key={`${node.type}-${index}`}
                  type={node.type}
                  label={node.label}
                  description={node.description}
                  icon={node.icon}
                  category={node.category}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
