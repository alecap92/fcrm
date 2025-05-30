import { useEffect, useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  X,
  Check,
  MessageSquare,
  Bot,
  Settings,
  Globe,
  Webhook,
  Search,
  AlertCircle,
  ExternalLink,
  Copy,
  CheckCircle,
  Loader2,
  Cog,
} from "lucide-react";
import { Button } from "../ui/button";
import integrationService from "../../services/integrationService";
import type { IntegrationProvider } from "../../types/settings";
import { useToast } from "../ui/toast";
import { useLoading } from "../../contexts/LoadingContext";

const availableProviders = [
  {
    id: "openai",
    name: "OpenAI",
    type: "ai",
    description: "Conecta con la API de OpenAI para funciones de IA",
    icon: Bot,
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "model", label: "Modelo (opcional)", type: "text" },
    ],
  },
  {
    id: "claude",
    name: "Claude AI",
    type: "ai",
    description: "Conecta con la API de Claude AI para funciones de IA",
    icon: Bot,
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "model", label: "Modelo (opcional)", type: "text" },
    ],
  },
  {
    id: "googlemaps",
    name: "Google Maps",
    type: "maps" as const,
    description: "Servicios de geolocalización con Google Maps",
    icon: Globe,
    fields: [{ key: "apiKey", label: "API Key", type: "password" }],
  },
  {
    id: "formuapp",
    name: "Formuapp",
    type: "forms" as const,
    description: "Formularios y encuestas de Formuapp",
    icon: Webhook,
    fields: [{ key: "apiKey", label: "API Key", type: "password" }],
  },
  {
    id: "whatsapp",
    name: "WhatsApp API",
    type: "whatsapp" as const,
    description: "Conexión con la API oficial de WhatsApp",
    icon: MessageSquare,
    fields: [
      { key: "accessToken", label: "Access Token", type: "password" },
      { key: "numberIdIdentifier", label: "Number ID", type: "text" },
      { key: "phoneNumber", label: "Número de Teléfono", type: "text" },
      {
        key: "whatsappAccountBusinessIdentifier",
        label: "Whatsapp Business Account Identifier",
        type: "text",
      },
    ],
  },
];

export function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState<IntegrationProvider[]>([]);
  const [selectedProvider, setSelectedProvider] =
    useState<IntegrationProvider | null>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    providerId: string;
    providerName: string;
  }>({
    isOpen: false,
    providerId: "",
    providerName: "",
  });

  const toast = useToast();
  const { showLoading, hideLoading } = useLoading();

  // Cargar integraciones al montar el componente
  const getIntegrations = async () => {
    try {
      setIsLoading(true);
      const response = await integrationService.getIntegrations();
      if (response.data) {
        setIntegrations(response.data);
      }
    } catch (error) {
      console.error("Error fetching integrations:", error);
      toast.show({
        title: "Error",
        description: "No se pudieron cargar las integraciones",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener integraciones al cargar el componente
  useEffect(() => {
    getIntegrations();
  }, []);

  const handleSave = async () => {
    if (!selectedProvider) return;

    try {
      setIsSaving(true);
      showLoading("Guardando configuración...");

      let response;

      // Si es una edición, usar updateIntegration
      if (selectedProvider._id) {
        response = await integrationService.updateIntegration(
          selectedProvider._id,
          selectedProvider
        );
      } else {
        // Si es nueva, usar createIntegration
        response = await integrationService.createIntegration(selectedProvider);
      }

      if (response) {
        // Actualizar la lista de integraciones
        if (selectedProvider._id) {
          setIntegrations((prev) =>
            prev.map((item) =>
              item._id === selectedProvider._id ? response : item
            )
          );
        } else {
          // Si es nueva, agregarla a la lista
          setIntegrations((prev) => [...prev, response]);
        }

        toast.show({
          title: "Éxito",
          description: "Integración guardada correctamente",
          type: "success",
        });

        // Cerrar el modal y actualizar el estado
        setShowProviderModal(false);
        setSelectedProvider(null);
        setHasChanges(false);

        // Refrescar la lista completa de integraciones
        getIntegrations();
      }
    } catch (error) {
      console.error("Error saving integration:", error);
      toast.show({
        title: "Error",
        description: "No se pudo guardar la integración",
        type: "error",
      });
    } finally {
      setIsSaving(false);
      hideLoading();
    }
  };

  const confirmDeleteProvider = (providerId: string, providerName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      providerId,
      providerName,
    });
  };

  const handleDeleteProvider = async (providerId: string) => {
    try {
      showLoading("Eliminando integración...");
      await integrationService.deleteIntegration(providerId);

      setIntegrations((prev) =>
        prev.filter((provider) => provider._id !== providerId)
      );

      toast.show({
        title: "Éxito",
        description: "Integración eliminada correctamente",
        type: "success",
      });

      setHasChanges(true);
      setDeleteConfirmation({
        isOpen: false,
        providerId: "",
        providerName: "",
      });
    } catch (error) {
      console.error("Error deleting integration:", error);
      toast.show({
        title: "Error",
        description: "No se pudo eliminar la integración",
        type: "error",
      });
    } finally {
      hideLoading();
    }
  };

  const handleCopyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(fieldKey);
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch((err) => {
        console.error("Error copying text: ", err);
      });
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case "whatsapp":
        return MessageSquare;
      case "ai":
        return Bot;
      case "maps":
        return Globe;
      case "forms":
        return Webhook;
      default:
        return Settings;
    }
  };

  const filteredProviders = availableProviders.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isProviderConfigured = (providerId: string) => {
    return integrations.some((p) => p.service === providerId);
  };

  const handleEditProvider = (provider: IntegrationProvider) => {
    // Buscar la definición completa del proveedor
    const providerDefinition = availableProviders.find(
      (p) => p.id === provider.service
    );

    if (providerDefinition) {
      setSelectedProvider(provider);
      setShowProviderModal(true);
    }
  };

  const handleAddNewProvider = () => {
    setSelectedProvider(null);
    setShowProviderModal(true);
  };

  const handleSelectProvider = (provider: any) => {
    setSelectedProvider({
      name: provider.name,
      service: provider.id,
      _id: "",
      isActive: false,
      credentials: {},
    });
  };

  const getCurrentProviderDefinition = () => {
    if (!selectedProvider) return null;
    return availableProviders.find((p) => p.id === selectedProvider.service);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Integraciones</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona las integraciones con servicios externos
          </p>
        </div>
        <Button onClick={handleAddNewProvider}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Integración
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-action animate-spin mb-4" />
            <p className="text-gray-500">Cargando integraciones...</p>
          </div>
        </div>
      ) : integrations.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
            <Settings className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay integraciones configuradas
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            Conecta tu aplicación con servicios externos para ampliar su
            funcionalidad
          </p>
          <Button onClick={handleAddNewProvider}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Integración
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Integrations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((provider) => {
              return (
                <div
                  key={provider._id}
                  className={`bg-white rounded-lg border p-4 relative transition-all ${
                    provider.isActive ? "border-green-200" : "border-gray-200"
                  }`}
                >
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() =>
                          confirmDeleteProvider(provider._id, provider.name)
                        }
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-lg ${
                        provider.isActive ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      <Cog className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {provider.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-sm ${
                          provider.isActive ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {provider.isActive ? "Activo" : "Inactivo"}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProvider(provider)}
                      >
                        Configurar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Provider Modal (used for both Add and Edit) */}
      {showProviderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedProvider && selectedProvider._id
                  ? "Editar Integración"
                  : "Agregar Nueva Integración"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowProviderModal(false);
                  setSelectedProvider(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* If we're adding a new integration and haven't selected a provider yet */}
            {!selectedProvider && (
              <>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar integraciones..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProviders.map((provider) => {
                    const Icon = provider.icon;
                    const isConfigured = isProviderConfigured(provider.id);

                    return (
                      <button
                        key={provider.id}
                        className={`
                          p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors relative
                          ${isConfigured ? "opacity-75 cursor-not-allowed" : ""}
                        `}
                        onClick={() => {
                          if (!isConfigured) {
                            handleSelectProvider(provider);
                          }
                        }}
                        disabled={isConfigured}
                      >
                        {isConfigured && (
                          <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Configurado
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {provider.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {provider.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* If we've selected a provider (either for edit or new) */}
            {selectedProvider && (
              <div className="space-y-4">
                {/* Get the fields from availableProviders based on the service */}
                {getCurrentProviderDefinition()?.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <div className="relative">
                      {field.type === "textarea" ? (
                        <textarea
                          value={selectedProvider.credentials[field.key] || ""}
                          onChange={(e) =>
                            setSelectedProvider({
                              ...selectedProvider,
                              credentials: {
                                ...selectedProvider.credentials,
                                [field.key]: e.target.value,
                              },
                            })
                          }
                          rows={4}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                        />
                      ) : field.type === "password" ? (
                        <div className="flex">
                          <input
                            type="text"
                            value={
                              selectedProvider.credentials[field.key] || ""
                            }
                            onChange={(e) =>
                              setSelectedProvider({
                                ...selectedProvider,
                                credentials: {
                                  ...selectedProvider.credentials,
                                  [field.key]: e.target.value,
                                },
                              })
                            }
                            className="mt-1 block w-full rounded-l-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyToClipboard(
                                selectedProvider.credentials[field.key] || "",
                                `credential-${field.key}`
                              )
                            }
                            className="mt-1 px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                            title="Copiar"
                          >
                            {copiedField === `credential-${field.key}` ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          value={selectedProvider.credentials[field.key] || ""}
                          onChange={(e) =>
                            setSelectedProvider({
                              ...selectedProvider,
                              credentials: {
                                ...selectedProvider.credentials,
                                [field.key]: e.target.value,
                              },
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                        />
                      )}
                    </div>
                    {field.key === "apiKey" && (
                      <p className="mt-1 text-xs text-gray-500">
                        Puedes encontrar tu API key en el panel de control de{" "}
                        {selectedProvider.name}.
                      </p>
                    )}
                  </div>
                ))}

                {selectedProvider.service === "whatsapp" && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Información importante
                    </h4>
                    <p className="text-sm text-blue-700">
                      Para completar la configuración de WhatsApp, deberás
                      configurar un webhook en la plataforma de Meta for
                      Developers.
                    </p>
                    <a
                      href="https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/set-up"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      Ver documentación
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowProviderModal(false);
                      setSelectedProvider(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Guardar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Eliminar integración
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar la integración con{" "}
                  {deleteConfirmation.providerName}? Esta acción no se puede
                  deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteConfirmation({
                    isOpen: false,
                    providerId: "",
                    providerName: "",
                  })
                }
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  handleDeleteProvider(deleteConfirmation.providerId)
                }
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
