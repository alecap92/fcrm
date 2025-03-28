import { useState } from "react";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Plus,
  X,
  Check,
} from "lucide-react";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: any) => void;
}

export default function CreateContactModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateContactModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    source: "",
    tags: "",
    notes: "",
  });

  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: "",
      });
      setNewTag("");
    }
  };

  //   const handleRemoveTag = (tag: string) => {
  //     setFormData({
  //       ...formData,
  //     });
  //   };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const contactProperties = Object.keys(formData).map((key) => ({
      key,
      value: formData[key],
    }));

    onSubmit(contactProperties);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Contacto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="block w-full pl-10 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="John"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Apellido
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="block w-full pl-10 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                placeholder="+1234567890"
              />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Información de la Empresa
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Empresa
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className="block w-full pl-10 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="Acme Inc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cargo
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="block w-full pl-10 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="CEO"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sitio Web
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Dirección</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dirección
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                placeholder="123 Main St"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ciudad
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                placeholder="Ciudad"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estado/Provincia
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                placeholder="Estado"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                País
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                placeholder="País"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Código Postal
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                placeholder="12345"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Información Adicional
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Origen
            </label>
            <select
              value={formData.source}
              onChange={(e) =>
                setFormData({ ...formData, source: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            >
              <option value="">Seleccionar origen</option>
              <option value="website">Sitio Web</option>
              <option value="referral">Referido</option>
              <option value="social">Redes Sociales</option>
              <option value="event">Evento</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Etiquetas
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {/* {formData.tags.map((tag) => (
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
              ))} */}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                placeholder="Nueva etiqueta"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
              />
              <Button type="button" onClick={handleAddTag} disabled={!newTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              placeholder="Notas adicionales sobre el contacto..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit">
            <Check className="w-4 h-4 mr-2" />
            Crear Contacto
          </Button>
        </div>
      </form>
    </Modal>
  );
}
