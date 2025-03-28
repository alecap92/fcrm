import { useState } from 'react';
import { Plus, Grip, X, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { useSettingsStore } from '../../store/settingsStore';
import type { ContactField } from '../../types/settings';

export function ContactFieldsSettings() {
  const { contactFields, addContactField, updateContactField, deleteContactField } = useSettingsStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newField, setNewField] = useState<Omit<ContactField, 'id'>>({
    name: '',
    type: 'text',
    required: false,
    options: [],
  });
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (newOption && !newField.options?.includes(newOption)) {
      setNewField({
        ...newField,
        options: [...(newField.options || []), newOption],
      });
      setNewOption('');
    }
  };

  const handleRemoveOption = (option: string) => {
    setNewField({
      ...newField,
      options: newField.options?.filter(o => o !== option),
    });
  };

  const handleSubmit = () => {
    addContactField(newField);
    setShowAddModal(false);
    setNewField({
      name: '',
      type: 'text',
      required: false,
      options: [],
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Campos de Contacto</h2>
          <p className="mt-1 text-sm text-gray-500">
            Personaliza los campos de información de contactos
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Campo
        </Button>
      </div>

      <div className="space-y-4">
        {contactFields.map((field) => (
          <div
            key={field.id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border"
          >
            <Grip className="w-5 h-5 text-gray-400 cursor-move" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {field.name}
                </h3>
                {field.required && (
                  <span className="text-xs text-red-500">*</span>
                )}
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {field.type}
                </span>
              </div>
              {field.options && field.options.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {field.options.map((option) => (
                    <span
                      key={option}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => deleteContactField(field.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add Field Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nuevo Campo de Contacto
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre del campo
                  </label>
                  <input
                    type="text"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo
                  </label>
                  <select
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value as ContactField['type'] })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  >
                    <option value="text">Texto</option>
                    <option value="email">Email</option>
                    <option value="phone">Teléfono</option>
                    <option value="date">Fecha</option>
                    <option value="select">Selección</option>
                    <option value="checkbox">Casilla</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newField.required}
                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    className="h-4 w-4 text-action focus:ring-action border-gray-300 rounded"
                  />
                  <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
                    Campo requerido
                  </label>
                </div>

                {newField.type === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Opciones
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                        placeholder="Nueva opción"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                      />
                      <Button
                        onClick={handleAddOption}
                        disabled={!newOption}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {newField.options && newField.options.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {newField.options.map((option) => (
                          <span
                            key={option}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100"
                          >
                            <span className="text-sm">{option}</span>
                            <button
                              onClick={() => handleRemoveOption(option)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!newField.name}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Crear Campo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}