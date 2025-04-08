import { useState } from "react";
import { Save, Eye, EyeOff, MessageSquare, Phone } from "lucide-react";
import { Button } from "../ui/button";
import { useSettingsStore } from "../../store/settingsStore";

export function WhatsAppSettings() {
  const { whatsappConfig, updateWhatsAppConfig } = useSettingsStore();
  const [showToken, setShowToken] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleTestConnection = () => {
    // Test WhatsApp connection logic here
  };

  const handleSave = () => {
    // Save WhatsApp settings logic here
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Configuración de WhatsApp
      </h2>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Credenciales de API
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Token de Acceso
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type={showToken ? "text" : "password"}
                      value={whatsappConfig.accessToken}
                      onChange={(e) =>
                        updateWhatsAppConfig({ accessToken: e.target.value })
                      }
                      className="block w-full pr-10 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        {showToken ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Número de WhatsApp
              </h3>
              <div className="mt-4">
                <input
                  type="tel"
                  value={whatsappConfig.phoneNumber}
                  onChange={(e) =>
                    updateWhatsAppConfig({ phoneNumber: e.target.value })
                  }
                  className="block w-full rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Estado de la Conexión
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isConnected ? "Conectado" : "No conectado"}
              </p>
            </div>
            <Button variant="outline" onClick={handleTestConnection}>
              Probar Conexión
            </Button>
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
