import { useEffect, useState } from "react";
import { Plus, Grip, X, Check } from "lucide-react";
import { Button } from "../ui/button";

import type { ContactField } from "../../types/settings";
import { useAuth } from "../../contexts/AuthContext";
import { organizationService } from "../../services/organizationService";

export function ContactFieldsSettings() {
  const { organization } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newField, setNewField] = useState<Omit<ContactField, "id">>({
    label: "",
    key: "",
    isVisible: false,
  });

  const [contactFields, setContactFields] = useState<ContactField[]>([
    {
      label: "Nombre",
      key: "name",
      isVisible: true,
    },
  ]);

  const handleSubmit = async () => {
    await organizationService.updateOrganization({
      contactProperties: [
        ...contactFields,
        {
          label: newField.label,
          key: newField.key,
          isVisible: newField.isVisible,
        },
      ],
    });

    setNewField({
      label: "",
      key: "",
      isVisible: false,
    });
    setShowAddModal(false);
  };

  const deleteContactField = async (id: string) => {
    await organizationService.updateOrganization({
      contactProperties: contactFields.filter((field) => field._id !== id),
    });
    setContactFields((prevFields) =>
      prevFields.filter((field) => field._id !== id)
    );
  };

  useEffect(() => {
    setContactFields(organization.contactProperties);
  }, [organization]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Campos de Contacto
          </h2>
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
        {contactFields?.map((field) => (
          <div
            key={field._id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border"
          >
            <Grip className="w-5 h-5 text-gray-400 cursor-move" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {field.label}
                </h3>
                {field.isVisible && (
                  <span className="text-xs text-red-500">*</span>
                )}
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {field.key}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => deleteContactField(field._id as string)}
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
                    value={newField.label}
                    onChange={(e) =>
                      setNewField({ ...newField, label: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Key
                  </label>
                  <input
                    type="text"
                    value={newField.key}
                    onChange={(e) =>
                      setNewField({ ...newField, key: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newField.isVisible}
                    onChange={(e) =>
                      setNewField({ ...newField, isVisible: e.target.checked })
                    }
                    className="h-4 w-4 text-action focus:ring-action border-gray-300 rounded"
                  />
                  <label
                    htmlFor="required"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Campo requerido
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={!newField.label}>
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
