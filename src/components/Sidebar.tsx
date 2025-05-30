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
  Play,
  Globe,
} from "lucide-react";
import { Input } from "./ui/input";
import { Handle } from "reactflow";

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
    case "manual_trigger":
      return <Play className="w-4 h-4" />;
    case "whatsapp_trigger":
    case "whatsapp_message_trigger":
      return <MessageSquare className="w-4 h-4 text-green-600" />;
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
    case "send_mass_email":
      return <Mail className="w-4 h-4" />;
    case "webhook_trigger":
      return <Globe className="w-4 h-4" />;
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
          {category.toLowerCase()}
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
    automationType,
  } = useWorkflowStore();

  // Convertir tipos de nodos de la API al formato que necesitamos para mostrar
  const getNodeItems = (): NodeItemProps[] => {
    // Si es una automatización de conversación, mostrar nodos específicos de WhatsApp
    if (automationType === "conversation") {
      return [
        {
          type: "whatsapp_trigger",
          label: "WhatsApp Trigger",
          description: "Inicia cuando se recibe un mensaje de WhatsApp",
          icon: getNodeIcon("whatsapp_trigger"),
          category: "trigger",
        },
        {
          type: "whatsapp_message_trigger",
          label: "Mensaje de WhatsApp",
          description:
            "Trigger específico para mensajes de WhatsApp con filtros avanzados",
          icon: getNodeIcon("whatsapp_message_trigger"),
          category: "trigger",
        },
        {
          type: "send_whatsapp",
          label: "Enviar WhatsApp",
          description: "Envía un mensaje de WhatsApp",
          icon: getNodeIcon("whatsapp"),
          category: "action",
        },
        {
          type: "delay",
          label: "Esperar",
          description: "Espera un tiempo antes de continuar",
          icon: getNodeIcon("delay"),
          category: "action",
        },
        {
          type: "condition",
          label: "Condición",
          description: "Evalúa el mensaje y toma decisiones",
          icon: getNodeIcon("condition"),
          category: "condition",
        },
        {
          type: "send_email",
          label: "Enviar Email",
          description: "Envía un email de notificación",
          icon: getNodeIcon("email"),
          category: "action",
        },
        {
          type: "http_request",
          label: "Webhook",
          description: "Envía datos a un servicio externo",
          icon: getNodeIcon("webhook"),
          category: "action",
        },
      ];
    }

    // Validar que availableNodeTypes sea un array antes de usarlo
    if (
      isLoadingNodeTypes ||
      !Array.isArray(availableNodeTypes) ||
      availableNodeTypes.length === 0
    ) {
      // Nodos predeterminados mientras cargamos o si no hay datos
      return [
        {
          type: "deals_trigger",
          label: "Deal Trigger",
          description: "Start when deal status changes",
          icon: getNodeIcon("deals_trigger"),
          category: "trigger",
        },
        {
          type: "manual_trigger",
          label: "Manual Trigger",
          description: "Start workflow with manual execution",
          icon: getNodeIcon("manual_trigger"),
          category: "trigger",
        },
        {
          type: "webhook_trigger",
          label: "Webhook Trigger",
          description: "Start when external data is received",
          icon: getNodeIcon("webhook_trigger"),
          category: "trigger",
        },
        {
          type: "whatsapp_trigger",
          label: "WhatsApp Trigger",
          description: "Inicia cuando se recibe un mensaje de WhatsApp",
          icon: getNodeIcon("whatsapp_trigger"),
          category: "trigger",
        },
        {
          type: "whatsapp_message_trigger",
          label: "Mensaje de WhatsApp",
          description:
            "Trigger específico para mensajes de WhatsApp con filtros avanzados",
          icon: getNodeIcon("whatsapp_message_trigger"),
          category: "trigger",
        },
        {
          type: "send_mass_email",
          label: "Massive Mail",
          description: "Send an email to multiple recipients",
          icon: getNodeIcon("email"),
          category: "action",
        },
        {
          type: "webhook",
          label: "HTTP Request",
          description: "Make HTTP request to external service",
          icon: getNodeIcon("webhook"),
          category: "action",
        },
        {
          type: "condition",
          label: "Condition",
          description: "Branch workflow based on conditions",
          icon: getNodeIcon("condition"),
          category: "condition",
        },
        {
          type: "email",
          label: "Send Email",
          description: "Send email notification",
          icon: getNodeIcon("email"),
          category: "action",
        },
        {
          type: "whatsapp",
          label: "Send WhatsApp",
          description: "Send WhatsApp message",
          icon: getNodeIcon("whatsapp"),
          category: "action",
        },
        {
          type: "delay",
          label: "Delay",
          description: "Wait for specified time",
          icon: getNodeIcon("delay"),
          category: "action",
        },
        {
          type: "transform",
          label: "Transform Data",
          description: "Modify data between steps",
          icon: getNodeIcon("transform"),
          category: "action",
        },
      ];
    }

    // Convertir desde los tipos de nodos de la API
    return availableNodeTypes.map((nodeType) => ({
      type: nodeType.type,
      label: nodeType.label,
      description: nodeType.description,
      icon: getNodeIcon(nodeType.type),
      category: nodeType.category.toLowerCase(),
    }));
  };

  // Obtener módulos y eventos para nodos tipo trigger
  const getTriggerNodes = (): NodeItemProps[] => {
    if (
      isLoadingModules ||
      !Array.isArray(availableModules) ||
      availableModules.length === 0
    ) {
      return [];
    }

    return availableModules.map((moduleEvent) => ({
      type: `${moduleEvent.module}_trigger`,
      label: `${moduleEvent.module}: ${moduleEvent.event}`,
      description: moduleEvent.description,
      icon: getNodeIcon("trigger"),
      category: "trigger",
    }));
  };

  // Combinar todos los nodos
  const allNodes = [...getNodeItems()];

  // Asegurar que manual_trigger siempre esté disponible
  if (!allNodes.some((node) => node.type === "manual_trigger")) {
    allNodes.push({
      type: "manual_trigger",
      label: "Manual Trigger",
      description: "Start workflow with manual execution",
      icon: getNodeIcon("manual_trigger"),
      category: "trigger",
    });
  }

  // Asegurar que massiveMail siempre esté disponible
  if (!allNodes.some((node) => node.type === "send_mass_email")) {
    allNodes.push({
      type: "send_mass_email",
      label: "Massive Mail",
      description: "Send an email to multiple recipients",
      icon: getNodeIcon("email"),
      category: "action",
    });
  }

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
      const category = node.category.toLowerCase();
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(node);
      return acc;
    },
    {} as Record<string, NodeItemProps[]>
  );

  // Orden de las categorías
  const categoryOrder = ["trigger", "condition", "action"];
  const sortedCategories = Object.keys(groupedNodes).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  return (
    <div className="w-60 bg-gray-50 border-r p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">
        {automationType === "conversation" ? "Nodos WhatsApp" : "Node Library"}
      </h2>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={
              automationType === "conversation"
                ? "Buscar nodos..."
                : "Search nodes..."
            }
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-8"
          />
        </div>
      </div>

      {automationType === "conversation" && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            💡 <strong>Tip:</strong> Estas automatizaciones se ejecutan cuando
            llegan mensajes de WhatsApp. Comienza con un WhatsApp Trigger.
          </p>
        </div>
      )}

      <div className="mb-4">
        <select
          className="w-full rounded-md border-gray-300"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="trigger">Triggers</option>
          <option value="action">Actions</option>
          <option value="condition">Conditions</option>
        </select>
      </div>

      {isLoadingNodeTypes ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div>
          {filteredNodes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No nodes found
            </p>
          ) : (
            filteredNodes.map((node) => <NodeItem key={node.type} {...node} />)
          )}
        </div>
      )}
    </div>
  );
};
