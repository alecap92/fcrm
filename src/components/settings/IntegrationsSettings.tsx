import { useState } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  Edit2, 
  X,
  Check,
  MessageSquare,
  MessageCircle,
  Bot,
  CreditCard,
  Truck,
  Settings,
  Globe,
  Power,
  Key,
  Webhook,
  Link2
} from 'lucide-react';
import { Button } from '../ui/button';
import { useSettingsStore } from '../../store/settingsStore';
import type { IntegrationProvider } from '../../types/settings';

const availableProviders = [
  {
    id: 'twilio',
    name: 'Twilio',
    type: 'whatsapp' as const,
    description: 'Send WhatsApp messages via Twilio',
    icon: MessageSquare,
    fields: [
      { key: 'accountSid', label: 'Account SID', type: 'text' },
      { key: 'authToken', label: 'Auth Token', type: 'password' },
      { key: 'phoneNumber', label: 'Phone Number', type: 'text' }
    ]
  },
  {
    id: 'messagebird',
    name: 'MessageBird',
    type: 'whatsapp' as const,
    description: 'WhatsApp Business API via MessageBird',
    icon: MessageCircle,
    fields: [
      { key: 'accessKey', label: 'Access Key', type: 'text' },
      { key: 'channelId', label: 'Channel ID', type: 'text' }
    ]
  },
  {
    id: '360dialog',
    name: '360dialog',
    type: 'whatsapp' as const,
    description: 'Official WhatsApp Business API provider',
    icon: MessageSquare,
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'text' },
      { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text' }
    ]
  },
  {
    id: 'dialogflow',
    name: 'Dialogflow',
    type: 'chatbot' as const,
    description: 'AI-powered chatbot by Google',
    icon: Bot,
    fields: [
      { key: 'projectId', label: 'Project ID', type: 'text' },
      { key: 'serviceAccountKey', label: 'Service Account Key', type: 'textarea' }
    ]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    type: 'payment' as const,
    description: 'Online payment processing',
    icon: CreditCard,
    fields: [
      { key: 'publishableKey', label: 'Publishable Key', type: 'text' },
      { key: 'secretKey', label: 'Secret Key', type: 'password' }
    ]
  },
  {
    id: 'dhl',
    name: 'DHL',
    type: 'shipping' as const,
    description: 'Shipping and tracking integration',
    icon: Truck,
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'text' },
      { key: 'accountNumber', label: 'Account Number', type: 'text' }
    ]
  }
];

export function IntegrationsSettings() {
  const { integrationsConfig, updateIntegrationsConfig } = useSettingsStore();
  const [editingProvider, setEditingProvider] = useState<IntegrationProvider | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // Save integrations settings logic here
    setHasChanges(false);
  };

  const handleToggleActive = (providerId: string) => {
    const updatedProviders = integrationsConfig.providers.map(provider =>
      provider.id === providerId
        ? { ...provider, isActive: !provider.isActive }
        : provider
    );
    updateIntegrationsConfig({ providers: updatedProviders });
    setHasChanges(true);
  };

  const handleDeleteProvider = (providerId: string) => {
    const updatedProviders = integrationsConfig.providers.filter(
      provider => provider.id !== providerId
    );
    updateIntegrationsConfig({ providers: updatedProviders });
    setHasChanges(true);
  };

  const getProviderIcon = (type: IntegrationProvider['type']) => {
    switch (type) {
      case 'whatsapp':
        return MessageSquare;
      case 'chatbot':
        return Bot;
      case 'payment':
        return CreditCard;
      case 'shipping':
        return Truck;
      default:
        return Settings;
    }
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
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Integración
        </Button>
      </div>

      <div className="space-y-6">
        {/* Active Integrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrationsConfig?.providers.map((provider) => {
            const Icon = getProviderIcon(provider.type);
            return (
              <div
                key={provider.id}
                className="bg-white rounded-lg border p-4 relative"
              >
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(provider.id)}
                      className={provider.isActive ? 'text-green-600' : 'text-gray-400'}
                    >
                      <Power className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingProvider(provider)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteProvider(provider.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{provider.name}</h3>
                    <p className="text-sm text-gray-500">{provider.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {provider.webhookUrl && (
                    <div className="flex items-center gap-2 text-sm">
                      <Webhook className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 truncate flex-1">
                        {provider.webhookUrl}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Link2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Key className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {provider.isConfigured ? 'Configured' : 'Not configured'}
                    </span>
                  </div>
                  {provider.apiEndpoint && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 truncate">
                        {provider.apiEndpoint}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Agregar Nueva Integración
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableProviders.map((provider) => {
                const Icon = provider.icon;
                const isConfigured = integrationsConfig?.providers.some(
                  p => p.id === provider.id
                );

                return (
                  <button
                    key={provider.id}
                    className={`
                      p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors
                      ${isConfigured ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => {
                      if (!isConfigured) {
                        setEditingProvider({
                          id: provider.id,
                          name: provider.name,
                          type: provider.type,
                          description: provider.description,
                          icon: provider.icon.name,
                          isConfigured: false,
                          isActive: false,
                          credentials: {},
                        });
                        setShowAddModal(false);
                      }
                    }}
                    disabled={isConfigured}
                  >
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
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Edit Modal */}
      {editingProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingProvider.isConfigured ? 'Editar' : 'Configurar'} {editingProvider.name}
            </h3>
            <div className="space-y-4">
              {availableProviders
                .find(p => p.id === editingProvider.id)
                ?.fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={editingProvider.credentials[field.key] || ''}
                        onChange={(e) => setEditingProvider({
                          ...editingProvider,
                          credentials: {
                            ...editingProvider.credentials,
                            [field.key]: e.target.value
                          }
                        })}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={editingProvider.credentials[field.key] || ''}
                        onChange={(e) => setEditingProvider({
                          ...editingProvider,
                          credentials: {
                            ...editingProvider.credentials,
                            [field.key]: e.target.value
                          }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                      />
                    )}
                  </div>
                ))}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Webhook URL (opcional)
                </label>
                <input
                  type="url"
                  value={editingProvider.webhookUrl || ''}
                  onChange={(e) => setEditingProvider({
                    ...editingProvider,
                    webhookUrl: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="https://"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  API Endpoint (opcional)
                </label>
                <input
                  type="url"
                  value={editingProvider.apiEndpoint || ''}
                  onChange={(e) => setEditingProvider({
                    ...editingProvider,
                    apiEndpoint: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="https://"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEditingProvider(null)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button>
                <Check className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}