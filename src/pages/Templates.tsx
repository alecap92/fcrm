import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare,
  Mail,
  FileText,
  Tag,
  Calendar,
  Copy,
  Edit2,
  Trash2,
  MoreVertical,
  Users
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'whatsapp' | 'email';
  category: string;
  content: string;
  variables: string[];
  tags: string[];
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

const dummyTemplates: Template[] = [
  {
    id: '1',
    name: 'Bienvenida Cliente',
    description: 'Mensaje de bienvenida para nuevos clientes',
    type: 'whatsapp',
    category: 'Onboarding',
    content: 'Hola {{nombre}}, ¡bienvenido/a! Gracias por confiar en nosotros.',
    variables: ['nombre'],
    tags: ['bienvenida', 'onboarding'],
    usageCount: 156,
    lastUsed: '2024-03-20T15:30:00Z',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-20T15:30:00Z'
  },
  {
    id: '2',
    name: 'Seguimiento Cotización',
    description: 'Email de seguimiento para cotizaciones enviadas',
    type: 'email',
    category: 'Ventas',
    content: 'Estimado/a {{nombre}}, \n\nEspero que hayas tenido la oportunidad de revisar la cotización que te enviamos...',
    variables: ['nombre', 'numero_cotizacion', 'monto'],
    tags: ['cotizacion', 'seguimiento'],
    usageCount: 89,
    lastUsed: '2024-03-19T14:20:00Z',
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2024-03-19T14:20:00Z'
  }
];

export function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>(dummyTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Plantillas</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona tus plantillas de mensajes y correos
              </p>
            </div>
            <Button onClick={() => navigate('/automations/templates/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </Button>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar plantillas..."
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
                  <option>Todas las categorías</option>
                  <option>Onboarding</option>
                  <option>Ventas</option>
                  <option>Soporte</option>
                </select>
                <select className="rounded-lg border-gray-300">
                  <option>Ordenar por</option>
                  <option>Más usadas</option>
                  <option>Más recientes</option>
                  <option>Alfabético</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      template.type === 'whatsapp' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {template.type === 'whatsapp' ? (
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      ) : (
                        <Mail className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500">{template.category}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {template.description}
                </p>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      {template.variables.length} variables
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {template.usageCount} usos
                    </div>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {format(new Date(template.updatedAt), 'dd/MM/yyyy')}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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