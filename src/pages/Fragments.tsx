import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  GripVertical,
  Pencil,
  Trash2,
  Copy,
  Tags,
  Check,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '../components/ui/toast';

interface Fragment {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const dummyFragments: Fragment[] = [
  {
    id: '1',
    title: 'Saludo Inicial',
    content: 'Estimado/a [Nombre],\n\nEspero que este mensaje te encuentre bien. Me pongo en contacto contigo para...',
    tags: ['saludo', 'formal'],
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Seguimiento de Propuesta',
    content: 'Quería hacer un seguimiento sobre la propuesta que te envié la semana pasada. ¿Has tenido la oportunidad de revisarla?',
    tags: ['seguimiento', 'ventas'],
    createdAt: '2024-03-14T15:30:00Z',
    updatedAt: '2024-03-14T15:30:00Z',
  },
  {
    id: '3',
    title: 'Agradecimiento',
    content: 'Muchas gracias por tu tiempo y atención. Quedo a la espera de tus comentarios.',
    tags: ['agradecimiento', 'formal'],
    createdAt: '2024-03-13T09:45:00Z',
    updatedAt: '2024-03-13T09:45:00Z',
  },
];

interface FragmentCardProps {
  fragment: Fragment;
  onEdit: (fragment: Fragment) => void;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
}

function FragmentCard({ fragment, onEdit, onDelete, onCopy }: FragmentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: fragment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {fragment.title}
            </h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {fragment.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-action/10 text-action"
                >
                  <Tags className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(fragment.content)}
              title="Copiar"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(fragment)}
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(fragment.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <pre className="whitespace-pre-wrap text-sm text-gray-600 font-sans">
            {fragment.content}
          </pre>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Actualizado el {new Date(fragment.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

interface FragmentFormProps {
  fragment?: Fragment;
  onSubmit: (fragment: Omit<Fragment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function FragmentForm({ fragment, onSubmit, onCancel }: FragmentFormProps) {
  const [formData, setFormData] = useState({
    title: fragment?.title || '',
    content: fragment?.content || '',
    tags: fragment?.tags || [],
  });
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            placeholder="Ej: Saludo formal"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contenido
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={5}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            placeholder="Escribe el contenido del fragmento..."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Etiquetas
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-gray-100"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              placeholder="Nueva etiqueta"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <Button
              type="button"
              onClick={handleAddTag}
              disabled={!newTag}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit">
          <Check className="w-4 h-4 mr-2" />
          {fragment ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}

export function Fragments() {
  const [fragments, setFragments] = useState<Fragment[]>(dummyFragments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingFragment, setEditingFragment] = useState<Fragment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    setFragments((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);

      return newItems;
    });
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.show({
        title: 'Copiado',
        description: 'El fragmento se ha copiado al portapapeles',
        type: 'success',
      });
    } catch (error) {
      toast.show({
        title: 'Error',
        description: 'No se pudo copiar el fragmento',
        type: 'error',
      });
    }
  };

  const handleCreate = (data: Omit<Fragment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFragment: Fragment = {
      ...data,
      id: `fragment_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFragments([...fragments, newFragment]);
    setIsCreating(false);
    toast.show({
      title: 'Fragmento creado',
      description: 'El fragmento se ha creado exitosamente',
      type: 'success',
    });
  };

  const handleUpdate = (data: Omit<Fragment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingFragment) return;

    const updatedFragment: Fragment = {
      ...editingFragment,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    setFragments(fragments.map(f => 
      f.id === editingFragment.id ? updatedFragment : f
    ));
    setEditingFragment(null);
    toast.show({
      title: 'Fragmento actualizado',
      description: 'El fragmento se ha actualizado exitosamente',
      type: 'success',
    });
  };

  const handleDelete = (id: string) => {
    setFragments(fragments.filter(f => f.id !== id));
    toast.show({
      title: 'Fragmento eliminado',
      description: 'El fragmento se ha eliminado exitosamente',
      type: 'success',
    });
  };

  const filteredFragments = fragments.filter(fragment => {
    const matchesSearch = 
      fragment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fragment.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = 
      selectedTags.length === 0 ||
      selectedTags.every(tag => fragment.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(
    new Set(fragments.flatMap(fragment => fragment.tags))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Fragmentos</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona tus fragmentos de texto reutilizables
              </p>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Fragmento
            </Button>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar fragmentos..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTags(current =>
                    current.includes(tag)
                      ? current.filter(t => t !== tag)
                      : [...current, tag]
                  )}
                  className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${selectedTags.includes(tag)
                      ? 'bg-action text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Tags className="w-3 h-3 mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {isCreating && (
            <FragmentForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          )}

          {editingFragment && (
            <FragmentForm
              fragment={editingFragment}
              onSubmit={handleUpdate}
              onCancel={() => setEditingFragment(null)}
            />
          )}

          <DndContext onDragEnd={handleDragEnd}>
            <SortableContext
              items={filteredFragments.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {filteredFragments.map((fragment) => (
                  <FragmentCard
                    key={fragment.id}
                    fragment={fragment}
                    onEdit={setEditingFragment}
                    onDelete={handleDelete}
                    onCopy={handleCopy}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {filteredFragments.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">
                No se encontraron fragmentos
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || selectedTags.length > 0
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza creando tu primer fragmento'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}