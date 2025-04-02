import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare,
  Mail,
  Clock,
  Play,
  Pause,
  MoreVertical,
  Edit2,
  Trash2,
  Users,
  Calendar
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Switch } from '../components/ui/switch';

interface Sequence {
  id: string;
  name: string;
  description: string;
  type: 'whatsapp' | 'email';
  steps: number;
  audience: {
    name: string;
    count: number;
  };
  status: 'active' | 'paused' | 'draft';
  isActive: boolean;
  stats?: {
    started: number;
    completed: number;
    conversion: number;
  };
  lastModified: string;
}

const dummySequences: Sequence[] = [
  {
    id: '1',
    name: 'Bienvenida Nuevos Clientes',
    description: 'Secuencia de mensajes de bienvenida para nuevos clientes',
    type: 'whatsapp',
    steps: 4,
    audience: {
      name: 'Nuevos Clientes',
      count: 250
    },
    status: 'active',
    isActive: true,
    stats: {
      started: 150,
      completed: 120,
      conversion: 80
    },
    lastModified: '2024-03-20T10:00:00Z'
  },
  {
    id: '2',
    name: 'Seguimiento de Cotizaciones',
    description: 'Secuencia de seguimiento para cotizaciones enviadas',
    type: 'email',
    steps: 3,
    audience: {
      name: 'Cotizaciones Pendientes',
      count: 75
    },
    status: 'paused',
    isActive: false,
    stats: {
      started: 45,
      completed: 30,
      conversion: 66.7
    },
    lastModified: '2024-03-19T15:30:00Z'
  }
];

const getStatusColor = (status: Sequence['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: Sequence['status']) => {
  switch (status) {
    case 'active':
      return <Play className="w-4 h-4" />;
    case 'paused':
      return <Pause className="w-4 h-4" />;
    case 'draft':
      return <Clock className="w-4 h-4" />;
  }
};

export function Sequences() {
  const navigate = useNavigate();
  const [sequences, setSequences] = useState<Sequence[]>(dummySequences);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleToggleActive = (sequenceId: string) => {
    setSequences(currentSequences =>
      currentSequences.map(sequence =>
        sequence.id === sequenceId
          ? { ...sequence, isActive: !sequence.isActive }
          : sequence
      )
    );
  };

  const filteredSequences = sequences.filter(sequence =>
    sequence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sequence.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Secuencias</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona tus secuencias de mensajes automatizados
              </p>
            </div>
            <Button onClick={() => navigate('/automations/sequences/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Secuencia
            </Button>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar secuencias..."
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
                  <option>Todos los tipos</option>
                  <option>WhatsApp</option>
                  <option>Email</option>
                </select>
                <select className="rounded-lg border-gray-300">
                  <option>Todos los estados</option>
                  <option>Activo</option>
                  <option>Pausado</option>
                  <option>Borrador</option>
                </select>
                <select className="rounded-lg border-gray-300">
                  <option>Todas las audiencias</option>
                  <option>Nuevos Clientes</option>
                  <option>Cotizaciones Pendientes</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSequences.map((sequence) => (
            <div
              key={sequence.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      sequence.type === 'whatsapp' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {sequence.type === 'whatsapp' ? (
                        <MessageSquare className={`w-5 h-5 ${
                          sequence.type === 'whatsapp' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      ) : (
                        <Mail className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{sequence.name}</h3>
                      <p className="text-sm text-gray-500">{sequence.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Pasos</span>
                    <span className="font-medium text-gray-900">{sequence.steps}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 rounded">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {sequence.audience.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sequence.audience.count} contactos
                      </div>
                    </div>
                  </div>

                  {sequence.stats && (
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {sequence.stats.started}
                          </div>
                          <div className="text-xs text-gray-500">Iniciados</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {sequence.stats.completed}
                          </div>
                          <div className="text-xs text-gray-500">Completados</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-green-600">
                            {sequence.stats.conversion}%
                          </div>
                          <div className="text-xs text-gray-500">Conversión</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`
                        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${getStatusColor(sequence.status)}
                      `}>
                        {getStatusIcon(sequence.status)}
                        {sequence.status.charAt(0).toUpperCase() + sequence.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {format(new Date(sequence.lastModified), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <Switch
                      checked={sequence.isActive}
                      onCheckedChange={() => handleToggleActive(sequence.id)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}