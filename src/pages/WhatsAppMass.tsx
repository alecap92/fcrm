import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar,
  MessageSquare,
  Users,
  Clock,
  Play,
  Pause,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  name: string;
  template: {
    name: string;
    category: string;
  };
  contactList: {
    name: string;
    count: number;
  };
  schedule: {
    date: string;
    time: string;
  };
  status: 'scheduled' | 'running' | 'completed' | 'paused';
  isActive: boolean;
  progress?: {
    sent: number;
    total: number;
  };
  createdAt: string;
}

const dummyCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Campaña Recordatorio de Citas',
    template: {
      name: 'Recordatorio de Cita',
      category: 'Citas'
    },
    contactList: {
      name: 'Clientes VIP',
      count: 156
    },
    schedule: {
      date: '2024-03-25',
      time: '09:00'
    },
    status: 'scheduled',
    isActive: true,
    createdAt: '2024-03-20'
  },
  {
    id: '2',
    name: 'Seguimiento Cotizaciones Marzo',
    template: {
      name: 'Seguimiento de Cotización',
      category: 'Ventas'
    },
    contactList: {
      name: 'Prospectos Tech',
      count: 89
    },
    schedule: {
      date: '2024-03-22',
      time: '10:30'
    },
    status: 'running',
    isActive: true,
    progress: {
      sent: 45,
      total: 89
    },
    createdAt: '2024-03-19'
  },
  {
    id: '3',
    name: 'Promoción Primavera 2024',
    template: {
      name: 'Promoción Especial',
      category: 'Marketing'
    },
    contactList: {
      name: 'Newsletter Subscribers',
      count: 450
    },
    schedule: {
      date: '2024-03-21',
      time: '15:00'
    },
    status: 'paused',
    isActive: false,
    progress: {
      sent: 200,
      total: 450
    },
    createdAt: '2024-03-18'
  }
];

const getStatusColor = (status: Campaign['status']) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'running':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800';
  }
};

const getStatusIcon = (status: Campaign['status']) => {
  switch (status) {
    case 'scheduled':
      return <Calendar className="w-4 h-4" />;
    case 'running':
      return <Play className="w-4 h-4" />;
    case 'completed':
      return <ChevronRight className="w-4 h-4" />;
    case 'paused':
      return <Pause className="w-4 h-4" />;
  }
};

export function WhatsAppMass() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>(dummyCampaigns);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleActive = (campaignId: string) => {
    setCampaigns(currentCampaigns =>
      currentCampaigns.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, isActive: !campaign.isActive }
          : campaign
      )
    );
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.contactList.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Campañas de WhatsApp</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona tus campañas de mensajes masivos
              </p>
            </div>
            <Button onClick={() => navigate('/mass-whatsapp/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Campaña
            </Button>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar campañas..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaña
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plantilla
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lista de Contactos
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programación
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
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Creada el {format(new Date(campaign.createdAt), 'dd/MM/yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MessageSquare className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.template.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {campaign.template.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.contactList.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {campaign.contactList.count} contactos
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {format(new Date(campaign.schedule.date), 'dd/MM/yyyy')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {campaign.schedule.time}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${getStatusColor(campaign.status)}
                        `}>
                          {getStatusIcon(campaign.status)}
                          <span className="ml-1">
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </span>
                        </span>
                        {campaign.progress && (
                          <div className="text-xs text-gray-500">
                            {campaign.progress.sent} de {campaign.progress.total} enviados
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Switch
                        checked={campaign.isActive}
                        onCheckedChange={() => handleToggleActive(campaign.id)}
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
    </div>
  );
}