import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit2,
  Plus,
  X,
  Tag,
  Award,
} from "lucide-react";

interface ConversationData {
  _id: string;
  title: string;
  organization: string;
  participants: {
    user: {
      reference: string;
      type: "User";
    };
    contact: {
      reference: string;
      type: "Contact";
    };
  };
  unreadCount: number;
  pipeline: any;
  currentStage: number;
  assignedTo: {
    _id: string;
    email: string;
  };
  isResolved: boolean;
  priority: string;
  tags: string[];
  leadScore: number;
  firstContactTimestamp: string;
  metadata: Array<{
    key: string;
    value: string;
    _id: string;
  }>;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  chatId: string;
  conversation?: ConversationData;
}

interface CustomerAttribute {
  id: string;
  label: string;
  value: string;
}

interface Note {
  id: string;
  content: string;
  timestamp: Date;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ chatId, conversation }) => {
  const [attributes, setAttributes] = useState<CustomerAttribute[]>([]);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      content: "Cliente interesado en plan premium",
      timestamp: new Date(),
    },
  ]);

  const [newNote, setNewNote] = useState("");
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const [newAttribute, setNewAttribute] = useState({ label: "", value: "" });

  // Convertir los metadatos y otra información de la conversación a atributos cuando se carga
  useEffect(() => {
    if (conversation) {
      const newAttributes: CustomerAttribute[] = [];

      // Añadir título como nombre
      newAttributes.push({
        id: "title",
        label: "Nombre",
        value: conversation.title,
      });

      // Añadir email del usuario asignado
      if (conversation.assignedTo && conversation.assignedTo.email) {
        newAttributes.push({
          id: "assigned",
          label: "Asignado a",
          value: conversation.assignedTo.email,
        });
      }

      // Añadir fecha de primer contacto
      if (conversation.firstContactTimestamp) {
        newAttributes.push({
          id: "firstContact",
          label: "Primer contacto",
          value: new Date(
            conversation.firstContactTimestamp
          ).toLocaleDateString(),
        });
      }

      // Añadir puntuación de lead
      newAttributes.push({
        id: "leadScore",
        label: "Puntuación",
        value: conversation.leadScore.toString(),
      });

      // Añadir metadatos
      conversation.metadata.forEach((meta) => {
        newAttributes.push({
          id: meta._id,
          label: meta.key.charAt(0).toUpperCase() + meta.key.slice(1), // Capitalize
          value: meta.value,
        });
      });

      setAttributes(newAttributes);
    }
  }, [conversation]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote,
      timestamp: new Date(),
    };

    setNotes((prev) => [note, ...prev]);
    setNewNote("");
  };

  const handleAddAttribute = () => {
    if (!newAttribute.label.trim() || !newAttribute.value.trim()) return;

    const attribute: CustomerAttribute = {
      id: Date.now().toString(),
      label: newAttribute.label,
      value: newAttribute.value,
    };

    setAttributes((prev) => [...prev, attribute]);
    setNewAttribute({ label: "", value: "" });
    setShowAddAttribute(false);
  };

  const handleDeleteAttribute = (id: string) => {
    setAttributes((prev) => prev.filter((attr) => attr.id !== id));
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  if (!conversation) {
    return (
      <div className="w-80 border-l border-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-gray-200 flex flex-col">
      {/* Customer Attributes */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-900">Detalles del Cliente</h4>
          <button
            onClick={() => setShowAddAttribute(true)}
            className="text-blue-500 hover:text-blue-600"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-3">
          {attributes.map((attr) => (
            <div
              key={attr.id}
              className="flex justify-between items-start group"
            >
              <div>
                <p className="text-sm text-gray-500">{attr.label}</p>
                <p className="text-gray-900">{attr.value}</p>
              </div>
              <button
                onClick={() => handleDeleteAttribute(attr.id)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Etiquetas */}
        {conversation.tags.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center mb-2">
              <Tag className="w-4 h-4 text-gray-500 mr-2" />
              <h4 className="font-medium text-gray-900">Etiquetas</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {conversation.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Información de pipeline */}
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <Award className="w-4 h-4 text-gray-500 mr-2" />
            <h4 className="font-medium text-gray-900">Pipeline</h4>
          </div>
          <p className="text-sm text-gray-700">{conversation.pipeline.name}</p>
          <p className="text-sm text-gray-700 mt-1">
            Etapa:{" "}
            {conversation.pipeline.stages[conversation.currentStage].name}
          </p>
        </div>

        {showAddAttribute && (
          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={newAttribute.label}
              onChange={(e) =>
                setNewAttribute((prev) => ({ ...prev, label: e.target.value }))
              }
              placeholder="Nombre del atributo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={newAttribute.value}
              onChange={(e) =>
                setNewAttribute((prev) => ({ ...prev, value: e.target.value }))
              }
              placeholder="Valor del atributo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAddAttribute}
                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600"
              >
                Añadir
              </button>
              <button
                onClick={() => setShowAddAttribute(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h4 className="font-semibold text-gray-900 mb-4">Notas</h4>

        {/* Add Note */}
        <div className="mb-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Añadir una nota..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
            rows={3}
          />
          <button
            onClick={handleAddNote}
            className="mt-2 w-full bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600"
          >
            Añadir Nota
          </button>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-gray-50 p-3 rounded-lg group relative"
            >
              <p className="text-gray-900">{note.content}</p>
              <p className="text-sm text-gray-500 mt-1">
                {note.timestamp.toLocaleString()}
              </p>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
