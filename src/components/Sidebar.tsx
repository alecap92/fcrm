import { Button } from './ui/button';
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
  RefreshCw
} from 'lucide-react';
import { useWorkflowStore } from '../store/workflow';

const nodeTypes = [
  // Triggers
  { type: 'deal_trigger', label: 'Deal Stage Change', icon: Building, color: 'bg-blue-500', category: 'Triggers' },
  { type: 'webhook_trigger', label: 'WordPress Form', icon: Globe, color: 'bg-blue-500', category: 'Triggers' },
  { type: 'contact_trigger', label: 'Contact Created', icon: UserPlus, color: 'bg-blue-500', category: 'Triggers' },
  { type: 'task_trigger', label: 'Task Completed', icon: CheckSquare, color: 'bg-blue-500', category: 'Triggers' },
  { type: 'date_trigger', label: 'Date (Cron)', icon: Calendar, color: 'bg-blue-500', category: 'Triggers' },
  
  // Handlers
  { type: 'chatgpt', label: 'ChatGPT', icon: Bot, color: 'bg-purple-500', category: 'Handlers' },
  { type: 'email', label: 'Send Email', icon: Mail, color: 'bg-green-500', category: 'Handlers' },
  { type: 'webhook', label: 'Webhook', icon: Globe, color: 'bg-orange-500', category: 'Handlers' },
  { type: 'create_deal', label: 'Create Deal', icon: Building, color: 'bg-indigo-500', category: 'Handlers' },
  { type: 'http', label: 'HTTP Request', icon: Globe, color: 'bg-purple-500', category: 'Handlers' },
  { type: 'condition', label: 'Condition', icon: GitBranch, color: 'bg-yellow-500', category: 'Handlers' },
  { type: 'create_quote', label: 'Create Quote', icon: FileText, color: 'bg-pink-500', category: 'Handlers' },
  { type: 'field_value', label: 'Field Value Changed', icon: RefreshCw, color: 'bg-cyan-500', category: 'Handlers' },
  { type: 'tag', label: 'Tag Management', icon: Tag, color: 'bg-red-500', category: 'Handlers' },
  { type: 'datetime', label: 'Date/Time Action', icon: Clock, color: 'bg-teal-500', category: 'Handlers' },
];

export const Sidebar = () => {
  const { nodes, isEditMode } = useWorkflowStore();
  const hasTrigger = nodes.some(node => node.type?.includes('trigger'));

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    if (!isEditMode) return;
    if (nodeType.includes('trigger') && hasTrigger) return;
    if (!nodeType.includes('trigger') && !hasTrigger) return;
    
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const groupedNodes = nodeTypes.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, typeof nodeTypes>);

  return (
    <div className="w-80 bg-white border-r p-4 overflow-y-auto">
      {!hasTrigger && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-700">Start by adding a trigger to your workflow</p>
        </div>
      )}
      {hasTrigger && (
        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg">
          <p className="text-sm text-green-700">Now add handlers to process your trigger</p>
        </div>
      )}
      {Object.entries(groupedNodes).map(([category, nodes]) => (
        <div key={category} className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{category}</h2>
          <div className="grid grid-cols-2 gap-2">
            {nodes.map(({ type, label, icon: Icon, color }) => {
              const isTrigger = type.includes('trigger');
              const isDisabled = (isTrigger && hasTrigger) || (!isTrigger && !hasTrigger);

              return (
                <div
                  key={type}
                  draggable={!isDisabled && isEditMode}
                  onDragStart={(e) => onDragStart(e, type)}
                  className={`
                    group relative rounded-lg border border-gray-200 bg-white p-2
                    ${isDisabled || !isEditMode ? 'cursor-not-allowed opacity-50' : 'cursor-move hover:border-primary hover:shadow-sm'}
                    transition-all duration-200 ease-in-out
                  `}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`${color} p-2 rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium line-clamp-2">
                      {label}
                    </span>
                  </div>
                  {!isDisabled && isEditMode && (
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};