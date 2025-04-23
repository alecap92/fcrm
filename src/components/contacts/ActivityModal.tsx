import React from 'react';
import { X, Calendar, FileText, Phone, Mail, Notebook, CheckCircle, XCircle, Plus, Edit, SquarePen, Bell } from 'lucide-react';
import { Activity } from '../../types/contact';

type ActivityType = "Reunion" | "Llamada" | "Correo" | "Nota";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Activity;
  setFormData: (data: Activity) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const activityTypes: { type: ActivityType; icon: React.ReactNode; label: string }[] = [
  { type: "Reunion", icon: <Calendar className="w-5 h-5" />, label: "Reunion" },
  { type: "Llamada", icon: <Phone className="w-5 h-5" />, label: "Llamada" },
  { type: "Correo", icon: <Mail className="w-5 h-5" />, label: "Correo" },
  { type: "Nota", icon: <SquarePen className="w-5 h-5" />, label: "Nota" },
];

const getActivityIcon = (type: ActivityType) => {
  const activity = activityTypes.find(a => a.type === type);
  return activity?.icon;
};

export default function ActivityModal({ isOpen, onClose, formData, setFormData, onSubmit }: ActivityModalProps) {
  if (!isOpen) return null;
  
  // Determinar si estamos editando o creando una nueva actividad
  const isEditing = Boolean(formData._id);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {getActivityIcon(formData.activityType)}
            <span>{isEditing ? "Editar Actividad" : "Nueva Actividad"}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <div className="flex gap-3">
              {activityTypes.map(({ type, icon, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, activityType: type })}
                  className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                    formData.activityType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                  }`}
                >
                  <div className={`${formData.activityType === type ? 'text-blue-500' : 'text-gray-500'}`}>
                    {icon}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Ingresa el título de la actividad"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Fecha
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Notebook className="w-4 h-4 text-blue-500" />
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none transition-all"
              placeholder="Añade notas adicionales..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              Estado
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.status === "incomplete"}
                  onChange={() => setFormData({ ...formData, status: "incomplete" })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-yellow-500" />
                  Incompleta
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.status === "complete"}
                  onChange={() => setFormData({ ...formData, status: "complete" })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Completa
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-500" />
              Programar recordatorio
            </label>
            <input
              type="datetime-local"
              value={formData.reminder}
              onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              {isEditing ? (
                <>
                  <Edit className="w-4 h-4" />
                  Actualizar Actividad
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Añadir Actividad
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}