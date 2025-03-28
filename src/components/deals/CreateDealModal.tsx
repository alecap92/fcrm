import { useState } from 'react';
import { Plus, X, Calendar, Building2, User, Tags as TagsIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import { format } from 'date-fns';
import type { Deal, DealStage } from '../../types/deal';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialStage?: DealStage;
}

const stages: { id: DealStage; label: string }[] = [
  { id: 'lead', label: 'Lead' },
  { id: 'qualification', label: 'Calificación' },
  { id: 'proposal', label: 'Propuesta' },
  { id: 'negotiation', label: 'Negociación' },
  { id: 'closed_won', label: 'Cerrado Ganado' },
  { id: 'closed_lost', label: 'Cerrado Perdido' },
];

const predefinedTags = [
  'high-priority',
  'low-budget',
  'enterprise',
  'renewal',
  'new-client',
  'referral',
  'urgent',
  'long-term',
];

export function CreateDealModal({ isOpen, onClose, onSubmit, initialStage = 'lead' }: CreateDealModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    stage: initialStage,
    probability: 0,
    expectedCloseDate: format(new Date(), 'yyyy-MM-dd'),
    company: {
      name: '',
      logo: '',
    },
    contact: {
      name: '',
      email: '',
      phone: '',
    },
    assignedTo: {
      id: '1',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    tags: [] as string[],
    customFields: {},
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      value: Number(formData.value),
      tags: selectedTags,
    });
    onClose();
  };

  const handleAddTag = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
      setNewTag('');
    }
  };

  const togglePredefinedTag = (tag: string) => {
    setSelectedTags(current =>
      current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear nuevo negocio">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del negocio *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              placeholder="Ej: Proyecto de consultoría"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              placeholder="Describe los detalles del negocio..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Valor *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Probabilidad (%)
              </label>
              <input
                type="number"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Etapa
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as DealStage })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              >
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha estimada de cierre
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                  className="block w-full pl-10 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Building2 className="w-4 h-4 mr-2" />
              Información de la empresa
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre de la empresa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    company: { ...formData.company, name: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="Ej: Acme Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.company.logo}
                  onChange={(e) => setFormData({
                    ...formData,
                    company: { ...formData.company, logo: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Información del contacto
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del contacto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, name: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="Ej: John Smith"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contact.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, email: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, phone: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <TagsIcon className="w-4 h-4 mr-2" />
              Etiquetas
            </h4>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {predefinedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => togglePredefinedTag(tag)}
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${selectedTags.includes(tag)
                        ? 'bg-action text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="Agregar etiqueta personalizada"
                />
                <Button type="button" onClick={handleAddTag} disabled={!newTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!formData.name || !formData.value || !formData.company.name || !formData.contact.name || !formData.contact.email}
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear negocio
          </Button>
        </div>
      </form>
    </Modal>
  );
}