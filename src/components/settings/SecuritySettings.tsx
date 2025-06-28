import { useState } from "react";
import { Save, Key, Shield, Lock, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { apiService } from "../../config/apiConfig";
import { useToast } from "../ui/toast";
import { AxiosResponse, AxiosError } from "axios";

interface LogoutSummary {
  totalEmployees: number;
  activeUsersBeforeLogout: number;
  usersUpdated: number;
  timestamp: string;
  organizationId: string;
}

interface LogoutResponse {
  success: boolean;
  message: string;
  summary: LogoutSummary | null;
  error?: string;
}

export function SecuritySettings() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleLogoutAllDevices = async () => {
    try {
      setIsLoading(true);
      const response: AxiosResponse<LogoutResponse> = await apiService.post(
        "/auth/logout-all"
      );
      console.log("[SecuritySettings] Respuesta del servidor:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Error desconocido");
      }

      const { summary } = response.data;

      if (!summary) {
        throw new Error("No se recibió información del cierre de sesión");
      }

      toast.show({
        title: "Sesiones cerradas",
        description: `Se han cerrado las sesiones de ${summary.usersUpdated} usuarios de un total de ${summary.totalEmployees} empleados.`,
        type: "success",
        duration: 5000,
      });

      if (summary.usersUpdated < summary.totalEmployees) {
        toast.show({
          title: "Advertencia",
          description: `${
            summary.totalEmployees - summary.usersUpdated
          } empleados no tenían sesión activa.`,
          type: "warning",
          duration: 5000,
        });
      }

      logout();
      navigate("/login");
    } catch (error) {
      console.error("[SecuritySettings] Error al cerrar sesión:", error);

      let errorMessage =
        "No se pudieron cerrar todas las sesiones. Por favor, inténtalo de nuevo.";

      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.show({
        title: "Error",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
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
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, twoFactor: checked })
                  }
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
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        passwordExpiry: Number(e.target.value),
                      })
                    }
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
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        minPasswordLength: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.requireSpecialChars}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          requireSpecialChars: e.target.checked,
                        })
                      }
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
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          requireNumbers: e.target.checked,
                        })
                      }
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
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          requireUppercase: e.target.checked,
                        })
                      }
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
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxLoginAttempts: Number(e.target.value),
                      })
                    }
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
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sessionTimeout: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout from all devices */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-red-100 rounded-lg">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Cerrar sesión en todos los dispositivos
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Esta acción cerrará todas las sesiones activas para todos
                    los empleados de la organización
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogoutAllDevices}
                  disabled={isLoading}
                >
                  {isLoading ? "Cerrando sesiones..." : "Cerrar Sesiones"}
                </Button>
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
