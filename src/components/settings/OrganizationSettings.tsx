import { Save, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { useSettingsStore } from "../../store/settingsStore";
import { useAuth } from "../../contexts/AuthContext";
import { organizationService } from "../../services/organizationService";
import { useState, useRef, useEffect } from "react";
import { useToast } from "../ui/toast";
import { Organization } from "../../types/settings";

export function OrganizationSettings() {
  const { updateOrganization } = useSettingsStore();
  const { organization: authOrganization } = useAuth();
  const [organization, setOrganization] =
    useState<Organization>(authOrganization);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Sincronizar con el contexto cuando cambie
  useEffect(() => {
    setOrganization(authOrganization);
  }, [authOrganization]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await organizationService.updateOrganization(organization);
      // Actualizar también el store local
      updateOrganization(organization);
      toast.show({
        title: "Éxito",
        description: "Organización actualizada correctamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving organization:", error);
      toast.show({
        title: "Error",
        description: "Error al actualizar la organización",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const response = await organizationService.uploadLogo(file);
      const updatedOrg = { ...organization, logoUrl: response.logoUrl };
      setOrganization(updatedOrg);
      updateOrganization({ logoUrl: response.logoUrl });
      toast.show({
        title: "Éxito",
        description: "Logo actualizado correctamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.show({
        title: "Error",
        description: "Error al subir el logo",
        type: "error",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleIconUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingIcon(true);
      const response = await organizationService.uploadIcon(file);
      const updatedOrg = { ...organization, iconUrl: response.iconUrl };
      setOrganization(updatedOrg);
      updateOrganization({ iconUrl: response.iconUrl });
      toast.show({
        title: "Éxito",
        description: "Icono actualizado correctamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error uploading icon:", error);
      toast.show({
        title: "Error",
        description: "Error al subir el icono",
        type: "error",
      });
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setOrganization((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setOrganization((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Perfil de la Organización
      </h2>
      <div className="space-y-6">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0 space-y-4">
            {/* Logo Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo de la Organización
              </label>
              <img
                src={organization.logoUrl || "/placeholder-logo.png"}
                alt={organization.companyName}
                className="w-24 h-24 rounded-lg object-cover border border-gray-200"
              />
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploadingLogo ? "Subiendo..." : "Cambiar Logo"}
              </Button>
            </div>

            {/* Icon Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icono de la Organización
              </label>
              <img
                src={organization.iconUrl || "/placeholder-icon.png"}
                alt={`Icono de ${organization.companyName}`}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
              />
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                onChange={handleIconUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => iconInputRef.current?.click()}
                disabled={isUploadingIcon}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploadingIcon ? "Subiendo..." : "Cambiar Icono"}
              </Button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre de la Organización
              </label>
              <input
                type="text"
                value={organization.companyName || ""}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
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
                value={organization.idNumber || ""}
                onChange={(e) => handleInputChange("idNumber", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={organization.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                value={organization.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <input
                type="text"
                value={organization.address?.address || ""}
                onChange={(e) => handleAddressChange("address", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ciudad
              </label>
              <input
                type="text"
                value={organization.address?.city || ""}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <input
                type="text"
                value={organization.address?.state || ""}
                onChange={(e) => handleAddressChange("state", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
}
