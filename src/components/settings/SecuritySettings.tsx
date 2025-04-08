import { useState } from 'react';
import { Save, Key, Shield, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';

export function SecuritySettings() {
  const [settings, setSettings] = useState({
    twoFactor: false,
    passwordExpiry: 90,
    minPasswordLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
  });

  const handleSave = () => {
    // Save security settings logic here
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Seguridad</h2>

      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Autenticación de dos factores
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Añade una capa extra de seguridad a tu cuenta
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactor}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactor: checked })}
                />
              </div>
              {settings.twoFactor && (
                <div className="mt-4">
                  <Button variant="outline" size="sm">
                    Configurar 2FA
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Password Policy */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Política de Contraseñas
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expiración de contraseña (días)
                  </label>
                  <input
                    type="number"
                    value={settings.passwordExpiry}
                    onChange={(e) => setSettings({ ...settings, passwordExpiry: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Longitud mínima
                  </label>
                  <input
                    type="number"
                    value={settings.minPasswordLength}
                    onChange={(e) => setSettings({ ...settings, minPasswordLength: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.requireSpecialChars}
                      onChange={(e) => setSettings({ ...settings, requireSpecialChars: e.target.checked })}
                      className="rounded border-gray-300 text-action focus:ring-action"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Requerir caracteres especiales
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.requireNumbers}
                      onChange={(e) => setSettings({ ...settings, requireNumbers: e.target.checked })}
                      className="rounded border-gray-300 text-action focus:ring-action"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Requerir números
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.requireUppercase}
                      onChange={(e) => setSettings({ ...settings, requireUppercase: e.target.checked })}
                      className="rounded border-gray-300 text-action focus:ring-action"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Requerir mayúsculas
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Security */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Seguridad de Sesión
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Máximo de intentos de inicio de sesión
                  </label>
                  <input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings({ ...settings, maxLoginAttempts: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tiempo de expiración de sesión (minutos)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>
              </div>
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