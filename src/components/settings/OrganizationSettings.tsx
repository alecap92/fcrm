import { Save } from "lucide-react";
import { Button } from "../ui/button";
import { useSettingsStore } from "../../store/settingsStore";
import { useAuth } from "../../contexts/AuthContext";

export function OrganizationSettings() {
  const { updateOrganization } = useSettingsStore();

  const { organization } = useAuth();

  const handleSave = () => {
    // Save organization logic here
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Perfil de la Organización
      </h2>
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <img
              src={organization.logoUrl}
              alt={organization.companyName}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <Button variant="outline" size="sm" className="mt-2 w-full">
              Cambiar Logo
            </Button>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre de la Organización
              </label>
              <input
                type="text"
                value={organization.companyName}
                onChange={(e) =>
                  updateOrganization({ companyName: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nit
              </label>
              <input
                type="text"
                value={organization.idNumber}
                onChange={(e) =>
                  updateOrganization({ idNumber: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={organization.email}
                onChange={(e) => updateOrganization({ email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                value={organization.phone}
                onChange={(e) => updateOrganization({ phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <input
                type="text"
                value={organization.address.address}
                onChange={(e) =>
                  updateOrganization({
                    address: {
                      ...organization.address,
                      address: e.target.value,
                    },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ciudad
              </label>
              <input
                type="text"
                value={organization.address.city}
                onChange={(e) =>
                  updateOrganization({
                    address: { ...organization.address, city: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <input
                type="text"
                value={organization.address.state}
                onChange={(e) =>
                  updateOrganization({
                    address: { ...organization.address, state: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
