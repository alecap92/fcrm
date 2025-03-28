import { useState } from 'react';
import { Save, Mail, Eye, EyeOff, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { useSettingsStore } from '../../store/settingsStore';

export function EmailSettings() {
  const { emailConfig, updateEmailConfig } = useSettingsStore();
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);

  const handleTestConnection = () => {
    // Test email connection logic here
  };

  const handleSendTestEmail = () => {
    // Send test email logic here
    setShowTestEmailModal(false);
  };

  const handleSave = () => {
    // Save email settings logic here
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Configuración de Email
      </h2>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Configuración SMTP
              </h3>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Servidor SMTP
                    </label>
                    <input
                      type="text"
                      value={emailConfig.host}
                      onChange={(e) => updateEmailConfig({ host: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                      placeholder="smtp.ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Puerto
                    </label>
                    <input
                      type="number"
                      value={emailConfig.port}
                      onChange={(e) => updateEmailConfig({ port: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={emailConfig.username}
                    onChange={(e) => updateEmailConfig({ username: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={emailConfig.password}
                      onChange={(e) => updateEmailConfig({ password: e.target.value })}
                      className="block w-full pr-10 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Encriptación
                  </label>
                  <select
                    value={emailConfig.encryption}
                    onChange={(e) => updateEmailConfig({ encryption: e.target.value as 'none' | 'ssl' | 'tls' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  >
                    <option value="none">Ninguna</option>
                    <option value="ssl">SSL</option>
                    <option value="tls">TLS</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Send className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Configuración de Envío
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre del Remitente
                  </label>
                  <input
                    type="text"
                    value={emailConfig.fromName}
                    onChange={(e) => updateEmailConfig({ fromName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email del Remitente
                  </label>
                  <input
                    type="email"
                    value={emailConfig.fromEmail}
                    onChange={(e) => updateEmailConfig({ fromEmail: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="space-x-3">
            <Button
              variant="outline"
              onClick={handleTestConnection}
            >
              Probar Conexión
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowTestEmailModal(true)}
            >
              Enviar Email de Prueba
            </Button>
          </div>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Test Email Modal */}
      {showTestEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Enviar Email de Prueba
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email de Destino
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  placeholder="tu@ejemplo.com"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTestEmailModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSendTestEmail}
                  disabled={!testEmail}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}