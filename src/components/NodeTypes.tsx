import { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import {
  Mail,
  MessageSquare,
  Globe,
  GitBranch,
  UserPlus,
  Zap,
  Calendar,
  CheckSquare,
  Bot,
  Building,
  Tag,
  Clock,
  FileText,
  RefreshCw,
  Trash2,
  Copy,
  Settings,
  Play,
  Users,
} from "lucide-react";
import { NodeEditor } from "./NodeEditor";
import { useAutomation } from "../contexts/AutomationContext";

const baseNodeStyle =
  "relative px-4 py-2 rounded-lg shadow-lg border min-w-[180px] cursor-pointer group";

const NodeActions = ({
  onDelete,
  onDuplicate,
  onEdit,
}: {
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
}) => (
  <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 -mt-8 bg-white rounded-md shadow-lg p-1">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
      className="p-1 hover:bg-gray-100 rounded"
      title="Edit"
    >
      <Settings className="w-4 h-4 text-gray-600" />
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDuplicate();
      }}
      className="p-1 hover:bg-gray-100 rounded"
      title="Duplicate"
    >
      <Copy className="w-4 h-4 text-gray-600" />
    </button>
    <button
      onClick={(e) => {
        console.log("🖱️ Delete button clicked for node");
        e.stopPropagation();
        onDelete();
      }}
      className="p-1 hover:bg-gray-100 rounded"
      title="Delete"
    >
      <Trash2 className="w-4 h-4 text-red-500" />
    </button>
  </div>
);

const NodeWrapper = ({
  children,
  type,
  data,
  id,
}: {
  children: React.ReactNode;
  type: string;
  data: any;
  id: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { deleteNode, duplicateNode } = useAutomation();

  const handleDelete = () => {
    console.log("🗑️ NodeTypes handleDelete called for node:", id);
    console.log("📊 deleteNode function:", deleteNode);
    deleteNode(id);
    console.log("✅ deleteNode called with id:", id);
  };

  const handleDuplicate = () => {
    duplicateNode(id);
  };

  return (
    <>
      <div className={baseNodeStyle}>
        <NodeActions
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onEdit={() => setIsEditing(true)}
        />
        {children}
      </div>
      {isEditing && (
        <NodeEditor
          nodeId={id}
          type={type}
          data={data}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
};

// Trigger Nodes
const DealTriggerNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="deals_trigger" data={data} id={id}>
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <Building className="w-4 h-4" />
      <div>
        <p className="font-semibold">Deal Stage Change</p>
        <p className="text-sm">{data.stage || "When deal stage changes..."}</p>
      </div>
    </div>
  </NodeWrapper>
);

const WebhookTriggerNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="webhook_trigger" data={data} id={id}>
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <div>
        <p className="font-semibold">Webhook Trigger</p>
        {data.webhookId ? (
          <p className="text-sm">ID: {data.webhookId.substring(0, 8)}...</p>
        ) : (
          <p className="text-sm">Pendiente de configurar...</p>
        )}
      </div>
    </div>
  </NodeWrapper>
);

const WhatsAppTriggerNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="whatsapp_trigger" data={data} id={id}>
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <MessageSquare className="w-4 h-4" />
      <div>
        <p className="font-semibold">WhatsApp Message</p>
        <p className="text-sm">{data.message || "When message received..."}</p>
      </div>
    </div>
  </NodeWrapper>
);

const ContactTriggerNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="contacts_trigger" data={data} id={id}>
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <UserPlus className="w-4 h-4" />
      <div>
        <p className="font-semibold">Contact Created</p>
        <p className="text-sm">When new contact is created...</p>
      </div>
    </div>
  </NodeWrapper>
);

const TaskTriggerNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="tasks_trigger" data={data} id={id}>
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <CheckSquare className="w-4 h-4" />
      <div>
        <p className="font-semibold">Task Completed</p>
        <p className="text-sm">When task is marked complete...</p>
      </div>
    </div>
  </NodeWrapper>
);

const DateTriggerNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="date_trigger" data={data} id={id}>
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4" />
      <div>
        <p className="font-semibold">Date Trigger</p>
        <p className="text-sm">{data.cron || "On schedule..."}</p>
      </div>
    </div>
  </NodeWrapper>
);

// Trigger manual
const ManualTriggerNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="manual_trigger" data={data} id={id}>
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <Play className="w-4 h-4" />
      <div>
        <p className="font-semibold">Manual Trigger</p>
        <p className="text-sm">
          {data.description || "Run workflow manually..."}
        </p>
      </div>
    </div>
  </NodeWrapper>
);

// Handler Nodes
const ChatGPTNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="chatgpt" data={data} id={id}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <Bot className="w-4 h-4" />
      <div>
        <p className="font-semibold">ChatGPT</p>
        <p className="text-sm">{data.prompt || "Process with AI..."}</p>
      </div>
    </div>
  </NodeWrapper>
);

const Contacts = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="contacts" data={data} id={id}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <UserPlus className="w-4 h-4" />
      <div>
        <p className="font-semibold">Contact Management</p>
        <p className="text-sm">{data.action || "Manage contacts..."}</p>
      </div>
    </div>
  </NodeWrapper>
);

const EmailNode = ({ id, data }: { id: string; data: any }) => {
  const { updateNode } = useAutomation();

  // Asegurarnos de que los campos requeridos estén configurados
  useEffect(() => {
    // Si algún campo requerido falta, actualizar el nodo con valores predeterminados
    if (!data.to || !data.subject || !data.emailBody) {
      updateNode(id, {
        to: data.to || data.recipient || "{{contact.email}}",
        subject: data.subject || "Notification",
        emailBody: data.emailBody || "<p>Default email content</p>",
      });
    }
    // Eliminar data de las dependencias para evitar bucles infinitos
  }, [id, updateNode]);

  return (
    <NodeWrapper type="email" data={data} id={id}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4" />
        <div>
          <p className="font-semibold">Send Email</p>
          <p className="text-sm">To: {data.to || data.recipient || "..."}</p>
        </div>
      </div>
    </NodeWrapper>
  );
};

// Nodo para email masivo
const MassiveMailNode = ({ id, data }: { id: string; data: any }) => {
  const { updateNode } = useAutomation();

  // Asegurarnos de que los campos requeridos estén configurados
  useEffect(() => {
    // Si algún campo requerido falta, actualizar el nodo con valores predeterminados
    if (!data.listId || !data.subject || !data.emailBody || !data.from) {
      updateNode(id, {
        listId: data.listId || "",
        from: data.from || "{{user.email}}",
        subject: data.subject || "Massive Email Campaign",
        emailBody: data.emailBody || "<p>Default massive email content</p>",
      });
    }
    // Eliminar data de las dependencias para evitar bucles infinitos
  }, [id, updateNode]);

  return (
    <NodeWrapper type="send_mass_email" data={data} id={id}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4" />
        <div>
          <p className="font-semibold">Massive Mail</p>
          <p className="text-sm">To List: {data.listId || "..."}</p>
          <p className="text-sm">Subject: {data.subject || "..."}</p>
        </div>
      </div>
    </NodeWrapper>
  );
};

const WebhookNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="webhook" data={data} id={id}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <div>
        <p className="font-semibold">Webhook</p>
        <p className="text-sm">{data.url || "Send webhook..."}</p>
      </div>
    </div>
  </NodeWrapper>
);

const CreateDealNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="create_deal" data={data} id={id}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <Building className="w-4 h-4" />
      <div>
        <p className="font-semibold">Create Deal</p>
        <p className="text-sm">Create CRM deal...</p>
      </div>
    </div>
  </NodeWrapper>
);

const HttpNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="http" data={data} id={id}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <div>
        <p className="font-semibold">HTTP Request</p>
        <p className="text-sm">{data.url || "Make request..."}</p>
      </div>
    </div>
  </NodeWrapper>
);

const ConditionNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="condition" data={data} id={id}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} id="true" />
    <Handle type="source" position={Position.Right} id="false" />
    <div className="flex items-center gap-2">
      <GitBranch className="w-4 h-4" />
      <div>
        <p className="font-semibold">Condition</p>
        <p className="text-sm">{data.condition || "If..."}</p>
      </div>
    </div>
  </NodeWrapper>
);

const CreateQuoteNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="create_quote" data={data} id={id}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <FileText className="w-4 h-4" />
      <div>
        <p className="font-semibold">Create Quote</p>
        <p className="text-sm">Generate quote...</p>
      </div>
    </div>
  </NodeWrapper>
);

const FieldValueNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="field_value" data={data} id={id}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <RefreshCw className="w-4 h-4" />
      <div>
        <p className="font-semibold">Field Value Changed</p>
        <p className="text-sm">{data.field || "Update field..."}</p>
      </div>
    </div>
  </NodeWrapper>
);

const TagNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="tag" data={data} id={id}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <Tag className="w-4 h-4" />
      <div>
        <p className="font-semibold">Tag Management</p>
        <p className="text-sm">{data.action || "Manage tags..."}</p>
      </div>
    </div>
  </NodeWrapper>
);

const DateTimeNode = ({ id, data }: { id: string; data: any }) => (
  <NodeWrapper type="datetime" data={data} id={id}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4" />
      <div>
        <p className="font-semibold">Date/Time Action</p>
        <p className="text-sm">{data.action || "Process date/time..."}</p>
      </div>
    </div>
  </NodeWrapper>
);

// Nodos adicionales para manejar otros tipos
const WhatsappNode = ({ id, data }: { id: string; data: any }) => {
  const { updateNode } = useAutomation();

  // Asegurarnos de que los campos requeridos estén configurados
  useEffect(() => {
    if (!data.to || !data.message) {
      updateNode(id, {
        to: data.to || "{{contact.phone}}",
        message: data.message || "Default WhatsApp message",
      });
    }
    // Eliminar data de las dependencias para evitar bucles infinitos
  }, [id, updateNode]);

  return (
    <NodeWrapper type="whatsapp" data={data} id={id}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        <div>
          <p className="font-semibold">Send WhatsApp</p>
          <p className="text-sm">To: {data.to || "..."}</p>
        </div>
      </div>
    </NodeWrapper>
  );
};

const DelayNode = ({ id, data }: { id: string; data: any }) => {
  const { updateNode } = useAutomation();

  useEffect(() => {
    // Asegurar que duration sea un número entero
    const duration = data.duration ? parseInt(data.duration, 10) : 5;
    if (!data.duration || isNaN(duration) || duration <= 0) {
      updateNode(id, {
        duration: 5,
        delayMinutes: 5, // Añadir este campo para compatibilidad con el backend
      });
    } else if (duration !== data.delayMinutes) {
      // Asegurar que ambos campos estén sincronizados
      updateNode(id, {
        delayMinutes: duration,
      });
    }
    // Eliminar data de las dependencias para evitar bucles infinitos
  }, [id, updateNode]);

  // Convertir duration a número para la visualización
  const displayDuration = data.duration ? parseInt(data.duration, 10) : 5;

  return (
    <NodeWrapper type="delay" data={data} id={id}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <div>
          <p className="font-semibold">Delay</p>
          <p className="text-sm">{displayDuration} minutes</p>
        </div>
      </div>
    </NodeWrapper>
  );
};

const TransformNode = ({ id, data }: { id: string; data: any }) => {
  const { updateNode } = useAutomation();

  useEffect(() => {
    if (!data.transformations) {
      updateNode(id, {
        transformations: data.transformations || [],
      });
    }
    // Eliminar data de las dependencias para evitar bucles infinitos
  }, [id, updateNode]);

  return (
    <NodeWrapper type="transform" data={data} id={id}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        <div>
          <p className="font-semibold">Transform Data</p>
          <p className="text-sm">Modify data...</p>
        </div>
      </div>
    </NodeWrapper>
  );
};

// Nuevo nodo específico para Mensaje de WhatsApp
const WhatsAppMessageTriggerNode = ({
  id,
  data,
}: {
  id: string;
  data: any;
}) => (
  <NodeWrapper type="whatsapp_message_trigger" data={data} id={id}>
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <MessageSquare className="w-4 h-4 text-green-600" />
      <div>
        <p className="font-semibold">Mensaje de WhatsApp</p>
        <p className="text-sm">
          {data.keywords
            ? `Palabras clave: ${data.keywords.join(", ")}`
            : "Cuando se reciba un mensaje..."}
        </p>
      </div>
    </div>
  </NodeWrapper>
);

export const nodeTypes = {
  // Triggers - adaptados a los nombres que usa el backend/sidebar
  deals_trigger: DealTriggerNode,
  deal_trigger: DealTriggerNode, // Alias para compatibilidad
  webhook_trigger: WebhookTriggerNode,
  whatsapp_trigger: WhatsAppTriggerNode, // Trigger general de WhatsApp
  contacts_trigger: ContactTriggerNode,
  contact_trigger: ContactTriggerNode, // Alias para compatibilidad
  tasks_trigger: TaskTriggerNode,
  task_trigger: TaskTriggerNode, // Alias para compatibilidad
  date_trigger: DateTriggerNode,
  manual_trigger: ManualTriggerNode, // Nuevo trigger manual
  contacts: Contacts, // Alias para compatibilidad con el backend
  WhatsAppTriggerNode: WhatsAppTriggerNode, // Alias para compatibilidad con el backend

  // Handlers
  chatgpt: ChatGPTNode,
  email: EmailNode,
  send_email: EmailNode, // Alias para compatibilidad con el backend
  mass_email: MassiveMailNode,
  send_mass_email: MassiveMailNode, // Alias para compatibilidad con el backend
  massiveMail: MassiveMailNode, // Nuevo nodo para correo masivo
  webhook: WebhookNode,
  http_request: WebhookNode, // Alias para compatibilidad con el backend
  create_deal: CreateDealNode,
  http: HttpNode,
  condition: ConditionNode,
  create_quote: CreateQuoteNode,
  field_value: FieldValueNode,
  tag: TagNode,
  datetime: DateTimeNode,

  // Nodos adicionales
  whatsapp: WhatsappNode,
  send_whatsapp: WhatsappNode, // Alias para compatibilidad con el backend
  delay: DelayNode,
  transform: TransformNode,

  // Nuevo nodo específico para Mensaje de WhatsApp
  whatsapp_message_trigger: WhatsAppMessageTriggerNode,
};

// Add the missing edgeTypes export
export const edgeTypes = {};
