import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Plus, Zap, Power, Calendar, MessageSquare, Mail, Globe, Search, Filter, Activity, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { Skeleton } from '../components/ui/skeleton';
import { useWorkflow } from '../contexts/WorkflowContext';

// Dummy data for automations
const automations = [
  {
    id: '1',
    name: 'Lead Nurturing Workflow',
    description: 'Automatically nurture leads with personalized emails based on their interactions',
    createdAt: '2024-03-15T10:30:00Z',
    isActive: true,
    triggerType: 'contact_trigger',
    lastRun: '2024-03-20T15:45:00Z',
    runsCount: 156,
    status: 'success' as const,
  },
  {
    id: '2',
    name: 'Deal Stage Updates',
    description: 'Send notifications when deals move to different stages',
    createdAt: '2024-03-10T08:20:00Z',
    isActive: false,
    triggerType: 'deal_trigger',
    lastRun: '2024-03-19T11:30:00Z',
    runsCount: 89,
    status: 'inactive' as const,
  },
  {
    id: '3',
    name: 'Task Completion Follow-up',
    description: 'Automatically create follow-up tasks when specific tasks are completed',
    createdAt: '2024-03-05T14:15:00Z',
    isActive: true,
    triggerType: 'task_trigger',
    lastRun: '2024-03-20T16:20:00Z',
    runsCount: 234,
    status: 'warning' as const,
  },
  {
    id: '4',
    name: 'Website Form Handler',
    description: 'Process new form submissions and create appropriate follow-up actions',
    createdAt: '2024-03-01T09:45:00Z',
    isActive: true,
    triggerType: 'webhook_trigger',
    lastRun: '2024-03-20T14:10:00Z',
    runsCount: 567,
    status: 'success' as const,
  },
  {
    id: '5',
    name: 'Daily Report Generator',
    description: 'Generate and send daily activity reports to team leaders',
    createdAt: '2024-02-28T11:00:00Z',
    isActive: true,
    triggerType: 'date_trigger',
    lastRun: '2024-03-20T07:00:00Z',
    runsCount: 45,
    status: 'error' as const,
  },
];

const getTriggerIcon = (triggerType: string) => {
  switch (triggerType) {
    case 'contact_trigger':
      return <MessageSquare className="w-5 h-5" />;
    case 'deal_trigger':
      return <Zap className="w-5 h-5" />;
    case 'task_trigger':
      return <Mail className="w-5 h-5" />;
    case 'webhook_trigger':
      return <Globe className="w-5 h-5" />;
    case 'date_trigger':
      return <Calendar className="w-5 h-5" />;
    default:
      return <Zap className="w-5 h-5" />;
  }
};

const getStatusColor = (status: 'success' | 'warning' | 'error' | 'inactive') => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-700';
    case 'warning':
      return 'bg-yellow-100 text-yellow-700';
    case 'error':
      return 'bg-red-100 text-red-700';
    case 'inactive':
      return 'bg-gray-100 text-gray-700';
  }
};

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  workflowName: string;
}

function DeleteConfirmationDialog({ isOpen, onClose, onConfirm, workflowName }: DeleteConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Workflow</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{workflowName}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [automationsList, setAutomationsList] = useState(automations);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; workflowId: string; workflowName: string }>({
    isOpen: false,
    workflowId: '',
    workflowName: '',
  });

  const { deleteWorkflow, toggleWorkflowActive } = useWorkflow();

  // Simulate loading
  setTimeout(() => setIsLoading(false), 1000);

  const handleDeleteWorkflow = async (id: string) => {
    try {
      await deleteWorkflow(id);
      setAutomationsList(currentList =>
        currentList.filter(automation => automation.id !== id)
      );
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await toggleWorkflowActive(id, isActive);
      setAutomationsList(currentList =>
        currentList.map(automation =>
          automation.id === id
            ? { ...automation, isActive: !automation.isActive }
            : automation
        )
      );
    } catch (error) {
      console.error('Failed to toggle workflow status:', error);
    }
  };

  const filteredAutomations = automationsList.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' ||
                         (activeFilter === 'active' && automation.isActive) ||
                         (activeFilter === 'inactive' && !automation.isActive);
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-36" />
          </div>
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-96" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-6">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your workflow automations
            </p>
          </div>
          <Link to="/workflow/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Automation
            </Button>
          </Link>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search automations..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex gap-2">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('all')}
              >
                All
              </Button>
              <Button
                variant={activeFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={activeFilter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('inactive')}
              >
                Inactive
              </Button>
            </div>
          </div>
        </div>

        {filteredAutomations.length === 0 ? (
          <EmptyState
            title="No automations found"
            description={
              searchTerm
                ? "No automations match your search criteria. Try adjusting your filters."
                : "Get started by creating your first automation workflow."
            }
            icon={<Activity className="w-12 h-12" />}
            action={{
              label: "New Automation",
              to: "/workflow/new"
            }}
          />
        ) : (
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            {filteredAutomations.map((automation) => (
              <div key={automation.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${automation.isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {getTriggerIcon(automation.triggerType)}
                      </div>
                      <div>
                        <Link 
                          to={`/workflow/${automation.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary group"
                        >
                          {automation.name}
                          <span className="inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                          </span>
                        </Link>
                        <p className="mt-1 text-sm text-gray-500">{automation.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(automation.status)}`}>
                          {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Created {format(new Date(automation.createdAt), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last run {format(new Date(automation.lastRun), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {automation.runsCount.toLocaleString()} runs
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteDialog({
                        isOpen: true,
                        workflowId: automation.id,
                        workflowName: automation.name,
                      })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <span className={`text-sm ${automation.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {automation.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      checked={automation.isActive}
                      onCheckedChange={() => handleToggleActive(automation.id, !automation.isActive)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, workflowId: '', workflowName: '' })}
        onConfirm={() => handleDeleteWorkflow(deleteDialog.workflowId)}
        workflowName={deleteDialog.workflowName}
      />
    </div>
  );
}