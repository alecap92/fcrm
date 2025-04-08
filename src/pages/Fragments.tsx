import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  GripVertical,
  Pencil,
  Trash2,
  Copy,
  Check,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "../components/ui/toast";
import fragmentsService from "../services/fragmentsService";
import type { Fragment, FragmentCreate } from "../types/fragment";
import { useDebouncer } from "../hooks/useDebbouncer";

interface FragmentCardProps {
  fragment: Fragment;
  onEdit: (fragment: Fragment) => void;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
}

function FragmentCard({
  fragment,
  onEdit,
  onDelete,
  onCopy,
}: FragmentCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: fragment._id });

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
              {fragment.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(fragment.text)}
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
              onClick={() => onDelete(fragment._id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <pre className="whitespace-pre-wrap text-sm text-gray-600 font-sans">
            {fragment.text}
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
  onSubmit: (fragment: FragmentCreate) => void;
  onCancel: () => void;
}

function FragmentForm({ fragment, onSubmit, onCancel }: FragmentFormProps) {
  const [formData, setFormData] = useState({
    name: fragment?.name || "",
    text: fragment?.text || "",
    atajo: fragment?.atajo || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            rows={5}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            placeholder="Escribe el contenido del fragmento..."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Atajo
          </label>
          <input
            type="text"
            value={formData.atajo}
            onChange={(e) =>
              setFormData({ ...formData, atajo: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            placeholder="Ej: :saludo"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit">
          <Check className="w-4 h-4 mr-2" />
          {fragment ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}

export function Fragments() {
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFragment, setEditingFragment] = useState<Fragment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();
  const debouncedSearch = useDebouncer(searchTerm, 500);

  useEffect(() => {
    loadFragments();
  }, [currentPage]);

  useEffect(() => {
    if (debouncedSearch) {
      searchFragments();
    } else {
      loadFragments();
    }
  }, [debouncedSearch]);

  const loadFragments = async () => {
    try {
      setIsLoading(true);
      const response = await fragmentsService.getFragments(currentPage);

      setCurrentPage(response.data.currentPage);
      setFragments(response.data.fragments);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error loading fragments:", error);
      toast.show({
        title: "Error",
        description: "Failed to load fragments",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchFragments = async () => {
    try {
      setIsLoading(true);
      const response = await fragmentsService.searchFragments(debouncedSearch);
      setFragments(response.data.fragments);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error searching fragments:", error);
      toast.show({
        title: "Error",
        description: "Failed to search fragments",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setFragments((items) => {
      const oldIndex = items.findIndex((item) => item._id === active.id);
      const newIndex = items.findIndex((item) => item._id === over.id);

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
        title: "Copiado",
        description: "El fragmento se ha copiado al portapapeles",
        type: "success",
      });
    } catch (error) {
      toast.show({
        title: "Error",
        description: "No se pudo copiar el fragmento",
        type: "error",
      });
    }
  };

  const handleCreate = async (data: FragmentCreate) => {
    try {
      const response = await fragmentsService.createFragment(data);
      setFragments([...fragments, response]);
      setIsCreating(false);
      toast.show({
        title: "Éxito",
        description: "Fragmento creado exitosamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error creating fragment:", error);
      toast.show({
        title: "Error",
        description: "No se pudo crear el fragmento",
        type: "error",
      });
    }
  };

  const handleUpdate = async (data: FragmentCreate) => {
    if (!editingFragment) return;

    try {
      const response = await fragmentsService.updateFragment(
        editingFragment._id,
        data
      );
      setFragments(
        fragments.map((f) => (f._id === editingFragment._id ? response : f))
      );
      setEditingFragment(null);
      toast.show({
        title: "Éxito",
        description: "Fragmento actualizado exitosamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating fragment:", error);
      toast.show({
        title: "Error",
        description: "No se pudo actualizar el fragmento",
        type: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fragmentsService.deleteFragment(id);
      setFragments(fragments.filter((f) => f._id !== id));
      toast.show({
        title: "Éxito",
        description: "Fragmento eliminado exitosamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting fragment:", error);
      toast.show({
        title: "Error",
        description: "No se pudo eliminar el fragmento",
        type: "error",
      });
    }
  };

  const filteredFragments = fragments.filter((fragment) => {
    const matchesSearch =
      fragment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fragment.text.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Fragmentos
              </h1>
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
              items={filteredFragments.map((f) => f._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-action mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Cargando fragmentos...
                    </p>
                  </div>
                ) : filteredFragments.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900">
                      No se encontraron fragmentos
                    </h3>
                  </div>
                ) : (
                  filteredFragments.map((fragment) => (
                    <FragmentCard
                      key={fragment._id}
                      fragment={fragment}
                      onEdit={setEditingFragment}
                      onDelete={handleDelete}
                      onCopy={handleCopy}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
          <p>{totalPages}</p>
        </div>
      </div>
    </div>
  );
}
