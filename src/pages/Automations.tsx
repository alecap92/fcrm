import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Zap,
  Calendar,
  MessageSquare,
  Mail,
  Globe,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Edit2,
  Trash2,
  List,
  FileText,
  Settings
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useToast } from '../components/ui/toast';
import { useWorkflow } from '../contexts/WorkflowContext';

const automationTabs = [
  { id: 'sequences', label: 'Secuencias', href: '/automations/sequences' },
  { id: 'automations', label: 'Mis Automatizaciones', href: '/automations' },
  { id: 'templates', label: 'Plantillas', href: '/automations/templates' },
];

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'whatsapp' | 'email' | 'webhook' | 'schedule';
    name: string;
  };
  isActive: boolean;
  lastRun: string | null;
  runsCount: number;
  status: 'success' | 'warning' | 'error' | 'inactive';
  createdAt: string;
}

const dummyAutomations: Automation[] = [
  {
    id: '1',
    name: 'Seguimiento de Cotizaciones',
    description: 'Envía recordatorios automáticos para cotizaciones pendientes',
    trigger: {
      type: 'schedule',
      name: 'Diariamente a las 9:00 AM'
    },
    isActive: true,
    lastRun: '2024-03-20T09:00:00Z',
    runsCount: 45,
    status: 'success',
    createdAt: '2024-03-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Bienvenida WhatsApp',
    description: 'Mensaje de bienvenida automático para nuevos contactos',
    trigger: {
      type: 'whatsapp',
      name: 'Nuevo contacto agregado'
    },
    isActive: true,
    lastRun: '2024-03-19T15:30:00Z',
    runsCount: 128,
    status: 'warning',
    createdAt: '2024-03-05T14:00:00Z'
  },
  {
    id: '3',
    name: 'Notificación de Formulario',
    description: 'Procesa nuevas entradas del formulario de contacto',
    trigger: {
      type: 'webhook',
      name: 'Formulario web enviado'
    },
    isActive: false,
    lastRun: '2024-03-18T11:20:00Z',
    runsCount: 67,
    status: 'inactive',
    createdAt: '2024-03-10T09:30:00Z'
  }
];

const getTriggerIcon = (type: Automation['trigger']['type']) => {
  switch (type) {
    case 'whatsapp':
      return <MessageSquare className="w-5 h-5" />;
    case 'email':
      return <Mail className="w-5 h-5" />;
    case 'webhook':
      return <Globe className="w-5 h-5" />;
    case 'schedule':
      return <Calendar className="w-5 h-5" />;
  }
};

const getStatusColor = (status: Automation['status']) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: Automation['status']) => {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'warning':
      return <ArrowUpRight className="w-4 h-4" />;
    case 'error':
      return <XCircle className="w-4 h-4" />;
    case 'inactive':
      return <Clock className="w-4 h-4" />;
  }
};

export function Automations() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [automationsList, setAutomationsList] = useState(dummyAutomations);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; workflowId: string; workflowName: string }>({
    isOpen: false,
    workflowId: '',
    workflowName: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleToggleActive = (automationId: string) => {
    setAutomationsList(currentAutomations =>
      currentAutomations.map(automation =>
        automation.id === automationId
          ? { 
              ...automation, 
              isActive: !automation.isActive,
              status: !automation.isActive ? 'success' : 'inactive'
            }
          : automation
      )
    );
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    setAutomationsList(currentAutomations =>
      currentAutomations.filter(automation => automation.id !== workflowId)
    );
  };

  const filteredAutomations = automationsList.filter(automation =>
    automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    automation.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Automatizaciones</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona tus flujos de trabajo automatizados
              </p>
            </div>
            <Link to="/workflow/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Automatización
              </Button>
            </Link>
          </div>

          <div className="mt-6 border-b">
            <nav className="-mb-px flex space-x-8">
              {automationTabs.map((tab) => {
                const isActive = location.pathname === tab.href;
                return (
                  <Link
                    key={tab.id}
                    to={tab.href}
                    className={`
                      whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                      ${isActive
                        ? 'border-action text-action'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar automatizaciones..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select className="rounded-lg border-gray-300">
                  <option>Todos los disparadores</option>
                  <option>WhatsApp</option>
                  <option>Email</option>
                  <option>Webhook</option>
                  <option>Programado</option>
                </select>
                <select className="rounded-lg border-gray-300">
                  <option>Todos los estados</option>
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
                <select className="rounded-lg border-gray-300">
                  <option>Todas las fechas</option>
                  <option>Hoy</option>
                  <option>Esta semana</option>
                  <option>Este mes</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Automatización
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disparador
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Ejecución
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activo
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAutomations.map((automation) => (
                  <tr key={automation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-action/10">
                          <Zap className="w-5 h-5 text-action" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {automation.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {automation.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-gray-100">
                          {getTriggerIcon(automation.trigger.type)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm text-gray-900">
                            {automation.trigger.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {automation.runsCount} ejecuciones
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {automation.lastRun ? (
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {format(new Date(automation.lastRun), 'dd/MM/yyyy HH:mm')}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Nunca</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${getStatusColor(automation.status)}
                      `}>
                        {getStatusIcon(automation.status)}
                        <span className="ml-1">
                          {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Switch
                        checked={automation.isActive}
                        onCheckedChange={() => handleToggleActive(automation.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Delete Workflow</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteDialog.workflowName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ isOpen: false, workflowId: '', workflowName: '' })}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteWorkflow(deleteDialog.workflowId);
                  setDeleteDialog({ isOpen: false, workflowId: '', workflowName: '' });
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}