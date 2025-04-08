import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  Mail,
  Users,
  Calendar,
  Clock,
  ChevronRight,
  Search,
  Plus,
  Image,
  Link,
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';

interface Template {
  id: string;
  name: string;
  category: string;
  subject: string;
  content: string;
  variables: string[];
  previewText: string;
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
    name: 'Newsletter Mensual',
    category: 'Marketing',
    subject: 'Novedades y actualizaciones de {{mes}}',
    previewText: 'Descubre las últimas novedades y actualizaciones de este mes',
    content: `
      <h1>Newsletter {{mes}}</h1>
      <p>Hola {{nombre}},</p>
      <p>Aquí tienes las últimas novedades:</p>
      <ul>
        <li>{{novedad_1}}</li>
        <li>{{novedad_2}}</li>
        <li>{{novedad_3}}</li>
      </ul>
    `,
    variables: ['mes', 'nombre', 'novedad_1', 'novedad_2', 'novedad_3']
  },
  {
    id: '2',
    name: 'Promoción Estacional',
    category: 'Ventas',
    subject: '¡Ofertas especiales de {{temporada}}!',
    previewText: 'No te pierdas nuestras ofertas especiales',
    content: `
      <h1>¡Ofertas de {{temporada}}!</h1>
      <p>Estimado/a {{nombre}},</p>
      <p>Aprovecha nuestras ofertas especiales:</p>
      <ul>
        <li>{{oferta_1}}</li>
        <li>{{oferta_2}}</li>
      </ul>
      <p>Válido hasta: {{fecha_limite}}</p>
    `,
    variables: ['temporada', 'nombre', 'oferta_1', 'oferta_2', 'fecha_limite']
  },
  {
    id: '3',
    name: 'Recordatorio Evento',
    category: 'Eventos',
    subject: 'Recordatorio: {{nombre_evento}} - {{fecha}}',
    previewText: 'Tu próximo evento está por comenzar',
    content: `
      <h1>{{nombre_evento}}</h1>
      <p>Hola {{nombre}},</p>
      <p>Te recordamos que el evento {{nombre_evento}} se realizará el {{fecha}} a las {{hora}}.</p>
      <p>Ubicación: {{ubicacion}}</p>
    `,
    variables: ['nombre_evento', 'nombre', 'fecha', 'hora', 'ubicacion']
  }
];

const dummyLists: ContactList[] = [
  {
    id: '1',
    name: 'Suscriptores Newsletter',
    count: 2500,
    tags: ['newsletter', 'activos'],
    lastUpdated: '2024-03-15'
  },
  {
    id: '2',
    name: 'Clientes Activos',
    count: 1200,
    tags: ['clientes', 'compradores'],
    lastUpdated: '2024-03-10'
  },
  {
    id: '3',
    name: 'Registrados Webinar',
    count: 350,
    tags: ['eventos', 'leads'],
    lastUpdated: '2024-03-05'
  }
];

export function EmailMassNew() {
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState({
    name: '',
    subject: '',
    previewText: '',
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
    navigate('/mass-email');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/mass-email')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Nueva Campaña de Email</h1>
              <p className="mt-1 text-sm text-gray-500">
                Crea una nueva campaña de correo electrónico
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
                placeholder="Ej: Newsletter Marzo 2024"
              />
            </div>

            {/* Subject and Preview Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Asunto
                </label>
                <input
                  type="text"
                  value={campaign.subject}
                  onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="Asunto del correo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Texto de vista previa
                </label>
                <input
                  type="text"
                  value={campaign.previewText}
                  onChange={(e) => setCampaign({ ...campaign, previewText: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="Texto que se muestra en la bandeja de entrada"
                />
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Plantilla de correo
              </label>
              {campaign.template ? (
                <div className="mt-1 p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
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
                  
                  {/* Email Editor */}
                  <div className="mt-4">
                    <div className="border rounded-lg">
                      {/* Toolbar */}
                      <div className="p-2 border-b flex items-center gap-1 flex-wrap">
                        <Button variant="ghost" size="sm">
                          <Bold className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Italic className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        <Button variant="ghost" size="sm">
                          <List className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ListOrdered className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        <Button variant="ghost" size="sm">
                          <AlignLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <AlignCenter className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <AlignRight className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        <Button variant="ghost" size="sm">
                          <Link className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Image className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: campaign.template.content }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Variables */}
                  {campaign.template.variables.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Variables
                      </h4>
                      <div className="space-y-2">
                        {campaign.template.variables.map((variable) => (
                          <div key={variable} className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {`{{${variable}}}`}
                            </span>
                            <input
                              type="text"
                              placeholder={variable.replace(/_/g, ' ')}
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
                onClick={() => navigate('/mass-email')}
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
                      setCampaign({ 
                        ...campaign, 
                        template,
                        subject: template.subject,
                        previewText: template.previewText
                      });
                      setShowTemplates(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
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
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">
                        {template.subject}
                      </p>
                      <p className="text-sm text-gray-500">
                        {template.previewText}
                      </p>
                    </div>
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