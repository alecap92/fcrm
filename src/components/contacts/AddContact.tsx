import { useEffect, useState } from "react";
import { X, Check, User, Building2, MapPin, StickyNote } from "lucide-react";
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
    notas: initialData?.notas || "",
    dv: initialData?.dv || "",
    idType: initialData?.idType || "",
    lifeCycle: initialData?.lifeCycle || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Limpiar el formulario después del envío
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      mobile: "",
      companyName: "",
      companyType: "",
      idNumber: "",
      position: "",
      website: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      source: "",
      tags: "",
      notas: "",
      dv: "",
      idType: "",
      lifeCycle: "",
    });
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
      dv: initialData?.dv || "",
      idType: initialData?.idType || "",
      notas: initialData?.notas || "",
      lifeCycle: initialData?.lifeCycle || "",
    });
  }, [initialData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar contacto" : "Nuevo contacto"}
      modalSize="XXL"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda */}
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center gap-2">
                <User className="h-4 w-4 text-gray-600" />
                <span>Información básica</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre <span className="text-red-500">*</span>
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
                    Apellido
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                    Teléfono
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
                    Celular <span className="text-red-500">*</span>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cargo
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

            <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-600" />
                <span>Empresa</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de la empresa
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Empresa <span className="text-red-500">*</span>
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
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, companyType: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  >
                    <option value="">-Selecciona un tipo de empresa-</option>
                    <option value="Personal">Personal</option>
                    <option value="Hospitales e IPS">Hospitales e IPS</option>
                    <option value="Bares y Restaurantes">
                      Bares y Restaurantes
                    </option>
                    <option value="Hoteles y Piscinas">
                      Hoteles y Piscinas
                    </option>
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
                  <label className="block text-sm font-medium text-gray-700">
                    Ciclo de vida <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.lifeCycle}
                    onChange={(e) =>
                      setFormData({ ...formData, lifeCycle: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  >
                    <option value="">-Selecciona un ciclo de vida-</option>
                    <option value="Lead">Lead</option>
                    <option value="Prospecto">Prospecto</option>
                    <option value="Cliente">Cliente</option>
                    <option value="Descalificado">Descalificado</option>
                    <option value="Perdido">Perdido</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de documento
                  </label>
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
                    <option value="8">
                      Documento de identificación extranjero
                    </option>
                    <option value="9">NIT de otro país</option>
                    <option value="10">NUIP *</option>
                    <option value="11">
                      PEP (Permiso Especial de Permanencia)
                    </option>
                    <option value="12">
                      PPT (Permiso Protección Temporal)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número de identificación
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
                    Dígito de verificación
                  </label>
                  <input
                    type="text"
                    value={formData.dv}
                    onChange={(e) =>
                      setFormData({ ...formData, dv: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                <span>Dirección</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Dirección
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ciudad <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
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
                      Departamento/Provincia
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Código postal
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({ ...formData, postalCode: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-gray-600" />
                <span>Información adicional</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Origen
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  >
                    <option value="">Selecciona origen</option>
                    <option value="website">Sitio web</option>
                    <option value="referral">Referencia</option>
                    <option value="social">Redes sociales</option>
                    <option value="evento">Evento</option>
                    <option value="newsletter">Boletín</option>
                    <option value="email">Email</option>
                    <option value="phone">Teléfono</option>
                    <option value="importacion">Importación</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notas
                  </label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) =>
                      setFormData({ ...formData, notas: e.target.value })
                    }
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    placeholder="Notas adicionales sobre el contacto..."
                    name="notas"
                    id="notas"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit">
            <Check className="w-4 h-4 mr-2" />
            {initialData ? "Actualizar" : "Crear"} contacto
          </Button>
        </div>
      </form>
    </Modal>
  );
}
