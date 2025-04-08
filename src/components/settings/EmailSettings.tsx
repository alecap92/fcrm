import { useState } from "react";
import { Save, Mail, Eye, EyeOff, Send } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { organizationService } from "../../services/organizationService";

export function EmailSettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);

  const { user } = useAuth();
  const emailConfig = user?.emailSettings;

  const handleUpdate = async (partialConfig: any) => {
    const updatedConfig = {
      ...emailConfig,
      ...partialConfig,
    };
    const response = await organizationService.updateOrganization({
      ...user,
      emailSettings: updatedConfig,
    });
    console.log("Update response:", response);
  };

  const updateSmtpField = (field: string, value: any) => {
    handleUpdate({
      smtpSettings: {
        ...emailConfig?.smtpSettings,
        [field]: value,
      },
    });
  };

  const updateImapField = (field: string, value: any) => {
    handleUpdate({
      imapSettings: {
        ...emailConfig?.imapSettings,
        [field]: value,
      },
    });
  };

  const handleTestConnection = async () => {
    alert("Lógica de prueba de conexión pendiente");
  };

  const handleSendTestEmail = async () => {
    alert(`Enviando correo de prueba a ${testEmail}`);
    setShowTestEmailModal(false);
  };

  const handleSave = async () => {
    const response = await organizationService.updateOrganization({
      ...user,
      emailSettings: emailConfig,
    });
    alert("Configuración guardada correctamente");
    console.log(response);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Configuración de Email
      </h2>

      <div className="space-y-6">
        {/* SMTP */}
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
                      value={emailConfig?.smtpSettings?.host || ""}
                      onChange={(e) => updateSmtpField("host", e.target.value)}
                      className="input"
                      placeholder="smtp.ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Puerto
                    </label>
                    <input
                      type="number"
                      value={emailConfig?.smtpSettings?.port || ""}
                      onChange={(e) =>
                        updateSmtpField("port", Number(e.target.value))
                      }
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={emailConfig?.smtpSettings?.user || ""}
                    onChange={(e) => updateSmtpField("user", e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={emailConfig?.smtpSettings?.password || ""}
                      onChange={(e) =>
                        updateSmtpField("password", e.target.value)
                      }
                      className="input pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-500"
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
                    value={emailConfig?.smtpSettings?.tls ? "ssl" : "none"}
                    onChange={(e) =>
                      updateSmtpField("encryption", e.target.value)
                    }
                    className="input"
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

        {/* IMAP */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Configuración IMAP
              </h3>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Servidor IMAP
                    </label>
                    <input
                      type="text"
                      value={emailConfig?.imapSettings?.host || ""}
                      onChange={(e) => updateImapField("host", e.target.value)}
                      className="input"
                      placeholder="imap.ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Puerto
                    </label>
                    <input
                      type="number"
                      value={emailConfig?.imapSettings?.port || ""}
                      onChange={(e) =>
                        updateImapField("port", Number(e.target.value))
                      }
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={emailConfig?.imapSettings?.user || ""}
                    onChange={(e) => updateImapField("user", e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={emailConfig?.imapSettings?.password || ""}
                      onChange={(e) =>
                        updateImapField("password", e.target.value)
                      }
                      className="input pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-500"
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
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between">
          <div className="space-x-3">
            <Button variant="outline" onClick={handleTestConnection}>
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

      {/* Modal de prueba */}
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
                  className="input"
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
                <Button onClick={handleSendTestEmail} disabled={!testEmail}>
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
