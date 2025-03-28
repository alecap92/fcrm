import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  MessageSquare,
  Users,
  Calendar,
  Clock,
  ChevronRight,
  Search,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
}

interface ContactList {
  id: string;
  name: string;
  count: number;
  tags: string[];
  lastUpdated: string;
}

const dummyTemplates: Template[] = [
  {
    id: '1',
    name: 'Recordatorio de Cita',
    category: 'Citas',
    content: 'Hola {{1}}, te recordamos tu cita programada para {{2}}. Por favor confirma tu asistencia.',
    variables: ['nombre', 'fecha_hora']
  },
  {
    id: '2',
    name: 'Seguimiento de Cotización',
    category: 'Ventas',
    content: 'Hola {{1}}, ¿qué te pareció la cotización que te enviamos? Estamos disponibles para resolver cualquier duda.',
    variables: ['nombre']
  },
  {
    id: '3',
    name: 'Promoción Especial',
    category: 'Marketing',
    content: 'Hola {{1}}, tenemos una promoción especial para ti: {{2}}. Válida hasta {{3}}.',
    variables: ['nombre', 'promocion', 'fecha_limite']
  }
];

const dummyLists: ContactList[] = [
  {
    id: '1',
    name: 'Clientes VIP',
    count: 156,
    tags: ['vip', 'client'],
    lastUpdated: '2024-03-15'
  },
  {
    id: '2',
    name: 'Prospectos Tech',
    count: 89,
    tags: ['prospect', 'tech'],
    lastUpdated: '2024-03-10'
  },
  {
    id: '3',
    name: 'Newsletter Subscribers',
    count: 450,
    tags: ['newsletter', 'marketing'],
    lastUpdated: '2024-03-05'
  }
];

export function WhatsAppMassNew() {
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState({
    name: '',
    template: null as Template | null,
    contactList: null as ContactList | null,
    schedule: {
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm')
    }
  });

  const [searchTerms, setSearchTerms] = useState({
    templates: '',
    lists: ''
  });

  const [showTemplates, setShowTemplates] = useState(false);
  const [showLists, setShowLists] = useState(false);

  const filteredTemplates = dummyTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerms.templates.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerms.templates.toLowerCase())
  );

  const filteredLists = dummyLists.filter(list =>
    list.name.toLowerCase().includes(searchTerms.lists.toLowerCase()) ||
    list.tags.some(tag => tag.toLowerCase().includes(searchTerms.lists.toLowerCase()))
  );

  const handleSave = () => {
    // Save campaign logic here
    navigate('/mass-whatsapp');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/mass-whatsapp')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Nueva Campaña</h1>
              <p className="mt-1 text-sm text-gray-500">
                Crea una nueva campaña de WhatsApp
              </p>
            </div>
          </div>

          <div className="max-w-3xl space-y-6">
            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre de la campaña
              </label>
              <input
                type="text"
                value={campaign.name}
                onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                placeholder="Ej: Campaña de Primavera 2024"
              />
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Plantilla de mensaje
              </label>
              {campaign.template ? (
                <div className="mt-1 p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {campaign.template.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {campaign.template.category}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setShowTemplates(true)}
                    >
                      Cambiar
                    </Button>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {campaign.template.content}
                    </p>
                  </div>
                  {campaign.template.variables.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Variables
                      </h4>
                      <div className="space-y-2">
                        {campaign.template.variables.map((variable, index) => (
                          <div key={variable} className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {`{{${index + 1}}}`}
                            </span>
                            <input
                              type="text"
                              placeholder={variable}
                              className="flex-1 text-sm rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="mt-1 w-full justify-between"
                  onClick={() => setShowTemplates(true)}
                >
                  <span className="text-gray-500">Seleccionar plantilla</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Contact List Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Lista de contactos
              </label>
              {campaign.contactList ? (
                <div className="mt-1 p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {campaign.contactList.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {campaign.contactList.count} contactos
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setShowLists(true)}
                    >
                      Cambiar
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {campaign.contactList.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="mt-1 w-full justify-between"
                  onClick={() => setShowLists(true)}
                >
                  <span className="text-gray-500">Seleccionar lista</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Programación
              </label>
              <div className="mt-1 grid grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={campaign.schedule.date}
                      onChange={(e) => setCampaign({
                        ...campaign,
                        schedule: { ...campaign.schedule, date: e.target.value }
                      })}
                      className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      value={campaign.schedule.time}
                      onChange={(e) => setCampaign({
                        ...campaign,
                        schedule: { ...campaign.schedule, time: e.target.value }
                      })}
                      className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/mass-whatsapp')}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!campaign.name || !campaign.template || !campaign.contactList}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Campaña
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Template Selection Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Seleccionar Plantilla
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(false)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar plantillas..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                  value={searchTerms.templates}
                  onChange={(e) => setSearchTerms({ ...searchTerms, templates: e.target.value })}
                />
              </div>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left"
                    onClick={() => {
                      setCampaign({ ...campaign, template });
                      setShowTemplates(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {template.category}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {template.content}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50">
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Plantilla
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact List Selection Modal */}
      {showLists && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Seleccionar Lista de Contactos
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLists(false)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar listas..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                  value={searchTerms.lists}
                  onChange={(e) => setSearchTerms({ ...searchTerms, lists: e.target.value })}
                />
              </div>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {filteredLists.map((list) => (
                  <button
                    key={list.id}
                    className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left"
                    onClick={() => {
                      setCampaign({ ...campaign, contactList: list });
                      setShowLists(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {list.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {list.count} contactos
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {list.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50">
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Lista
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}