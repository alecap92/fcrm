import { 
  X,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  Tag as TagIcon,
  MessageSquare,
  FileText,
  Link,
  BarChart,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import type { Deal } from '../../types/deal';

interface DealDetailsModalProps {
  deal: Deal;
  onClose: () => void;
}

export function DealDetailsModal({ deal, onClose }: DealDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {deal.company.logo ? (
                <img
                  src={deal.company.logo}
                  alt={deal.company.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{deal.name}</h2>
                <p className="text-sm text-gray-500">{deal.company.name}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Descripción</h3>
                <p className="text-sm text-gray-600">{deal.description}</p>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Actividad Reciente</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Nuevo comentario añadido</p>
                      <p className="text-sm text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Documento adjuntado</p>
                      <p className="text-sm text-gray-500">Hace 1 día</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Valor actualizado</p>
                      <p className="text-sm text-gray-500">Hace 2 días</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Tareas</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Tarea
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-900">Enviar propuesta actualizada</span>
                    <span className="text-xs text-gray-500 ml-auto">Vence mañana</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-900">Programar reunión de seguimiento</span>
                    <span className="text-xs text-gray-500 ml-auto">Vence en 3 días</span>
                  </div>
                </div>
              </div>

              {/* Files */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Archivos</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Subir Archivo
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">propuesta_v1.pdf</p>
                      <p className="text-xs text-gray-500">2.5 MB • Subido hace 2 días</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Link className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">contrato.docx</p>
                      <p className="text-xs text-gray-500">1.8 MB • Subido hace 1 semana</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Link className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Deal Info */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Información del Negocio</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Valor
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      ${deal.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <BarChart className="w-4 h-4 mr-2" />
                      Probabilidad
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {deal.probability}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Fecha Estimada
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {format(new Date(deal.expectedCloseDate), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      Creado
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {format(new Date(deal.createdAt), 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Información de Contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{deal.company.name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{deal.contact.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{deal.contact.phone}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {deal.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-gray-100 text-gray-800"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assigned To */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Asignado a</h3>
                <div className="flex items-center gap-3">
                  <img
                    src={deal.assignedTo.avatar}
                    alt={deal.assignedTo.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {deal.assignedTo.name}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}