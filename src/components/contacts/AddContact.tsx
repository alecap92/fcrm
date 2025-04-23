import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Contact } from "../../types/contact";

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: any) => void;
  initialData?: Contact;
}

export default function CreateContactModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CreateContactModalProps) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    mobile: initialData?.mobile || "",
    companyName: initialData?.companyName || "",
    companyType: initialData?.companyType || "",
    idNumber: initialData?.idNumber || "",
    position: initialData?.position || "",
    website: "",
    address: initialData?.address?.street || "",
    city: initialData?.address?.city || "",
    state: initialData?.address?.state || "",
    country: initialData?.address?.country || "",
    postalCode: initialData?.address?.zipCode || "",
    source: "",
    tags: "",
    notes: "",
    dv: initialData?.dv || "",
    idType: initialData?.idType || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  useEffect(() => {
    setFormData({
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      mobile: initialData?.mobile || "",
      companyName: initialData?.companyName || "",
      companyType: initialData?.companyType || "",
      position: initialData?.position || "",
      idNumber: initialData?.idNumber || "",
      website: "",
      address: initialData?.address?.street || "",
      city: initialData?.address?.city || "",
      state: initialData?.address?.state || "",
      country: initialData?.address?.country || "",
      postalCode: initialData?.address?.zipCode || "",
      source: "",
      tags: "",
      notes: "",
      dv: initialData?.dv || "",
      idType: initialData?.idType || "",
    });
  }, [initialData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Contact" : "New Contact"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mobile <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) =>
                setFormData({ ...formData, mobile: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            />
          </div>
        </div>

        {/* Company Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={
                  [
                    "Personal",
                    "Hospitales e IPS",
                    "Bares y Restaurantes",
                    "Hoteles y Piscinas",
                    "Condominios y Apartamentos",
                    "Revendedor",
                    "Parques",
                    "Iglesia",
                    "Empresa",
                    "Gallera",
                    "Caja de Compensacion",
                    "Centro Vacacional",
                    "Actividades Turisticas",
                    "Proveedor",
                    "Colegios",
                    "Eventos",
                    "Otro",
                  ].includes(formData.companyType)
                    ? formData.companyType
                    : "Otro"
                }
                onChange={(e) =>
                  setFormData({ ...formData, companyType: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              >
                <option value="Personal">Personal</option>
                <option value="Hospitales e IPS">Hospitales e IPS</option>
                <option value="Bares y Restaurantes">
                  Bares y Restaurantes
                </option>
                <option value="Hoteles y Piscinas">Hoteles y Piscinas</option>
                <option value="Condominios y Apartamentos">
                  Condominios y Apartamentos
                </option>
                <option value="Revendedor">Revendedor</option>
                <option value="Parques">Parques</option>
                <option value="Iglesia">Iglesia</option>
                <option value="Empresa">Empresa</option>
                <option value="Gallera">Gallera</option>
                <option value="Caja de Compensacion">
                  Caja de Compensacion
                </option>
                <option value="Centro Vacacional">Centro Vacacional</option>
                <option value="Actividades Turisticas">
                  Actividades Turisticas
                </option>
                <option value="Proveedor">Proveedor</option>
                <option value="Colegios">Colegios</option>
                <option value="Eventos">Eventos</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de documento</label>
              <select
                value={formData.idType}
                onChange={(e) =>
                  setFormData({ ...formData, idType: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              >
                <option value="1">Registro civil</option>
                <option value="2">Tarjeta de identidad</option>
                <option value="3">Cédula de ciudadanía</option>
                <option value="4">Tarjeta de extranjería</option>
                <option value="5">Cédula de extranjería</option>
                <option value="6">NIT</option>
                <option value="7">Pasaporte</option>
                <option value="8">Documento de identificación extranjero</option>
                <option value="9">NIT de otro país</option>
                <option value="10">NUIP *</option>
                <option value="11">PEP (Permiso Especial de Permanencia)</option>
                <option value="12">PPT (Permiso Protección Temporal)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Numero de identificacion
              </label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) =>
                  setFormData({ ...formData, idNumber: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Digito de verificacion
              </label>
              <input
                type="text"
                value={formData.dv}
                onChange={(e) =>
                  setFormData({ ...formData, dv: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                State/Province
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Position
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Source
            </label>
            <select
              value={formData.source}
              onChange={(e) =>
                setFormData({ ...formData, source: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            >
              <option value="">Select source</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="social">Social Media</option>
              <option value="event">Event</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              placeholder="Additional notes about the contact..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit">
            <Check className="w-4 h-4 mr-2" />
            {initialData ? "Update" : "Create"} Contact
          </Button>
        </div>
      </form>
    </Modal>
  );
}
