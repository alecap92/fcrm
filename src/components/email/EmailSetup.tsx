import React, { useState } from "react";
import { useEmail } from "../../contexts/EmailContext";
import { EmailSettings, EMAIL_PROVIDERS } from "../../types/email";
import { Button } from "../ui/button";
import {
  Mail,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export function EmailSetup() {
  const { configureAccount } = useEmail();
  const [step, setStep] = useState<"provider" | "manual" | "credentials">(
    "provider"
  );
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState({
    emailAddress: "",
    password: "",
    imapHost: "",
    imapPort: 993,
    smtpHost: "",
    smtpPort: 587,
    imapTls: true,
    smtpSecure: false,
  });

  const handleProviderSelect = (providerName: string) => {
    const provider = EMAIL_PROVIDERS.find((p) => p.name === providerName);
    if (provider) {
      setSelectedProvider(providerName);
      setFormData((prev) => ({
        ...prev,
        imapHost: provider.imapSettings.host,
        imapPort: provider.imapSettings.port,
        imapTls: provider.imapSettings.tls,
        smtpHost: provider.smtpSettings.host,
        smtpPort: provider.smtpSettings.port,
        smtpSecure: provider.smtpSettings.secure,
      }));
      setStep("credentials");
    }
  };

  const handleManualSetup = () => {
    setStep("manual");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const settings: EmailSettings = {
        emailAddress: formData.emailAddress,
        imapSettings: {
          host: formData.imapHost,
          port: formData.imapPort,
          user: formData.emailAddress,
          password: formData.password,
          tls: formData.imapTls,
        },
        smtpSettings: {
          host: formData.smtpHost,
          port: formData.smtpPort,
          user: formData.emailAddress,
          password: formData.password,
          secure: formData.smtpSecure,
        },
      };

      await configureAccount(settings);
    } catch (error: any) {
      setError(error.message || "Error al configurar la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  const renderProviderSelection = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configura tu cuenta de correo
        </h1>
        <p className="text-gray-600">
          Selecciona tu proveedor de correo o configura manualmente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {EMAIL_PROVIDERS.map((provider) => (
          <button
            key={provider.name}
            onClick={() => handleProviderSelect(provider.name)}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{provider.name}</h3>
              <p className="text-sm text-gray-500 mt-1">@{provider.domain}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center">
        <Button
          variant="outline"
          onClick={handleManualSetup}
          className="inline-flex items-center"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configuración manual
        </Button>
      </div>
    </div>
  );

  const renderCredentialsForm = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Credenciales de {selectedProvider}
        </h2>
        <p className="text-gray-600">Ingresa tu email y contraseña</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección de correo
          </label>
          <input
            type="email"
            required
            value={formData.emailAddress}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, emailAddress: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("provider")}
            className="flex-1"
          >
            Atrás
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Configurando...
              </>
            ) : (
              "Configurar cuenta"
            )}
          </Button>
        </div>
      </form>
    </div>
  );

  const renderManualForm = () => (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configuración manual
        </h2>
        <p className="text-gray-600">
          Configura manualmente los servidores IMAP y SMTP
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">
            Información de la cuenta
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección de correo
            </label>
            <input
              type="email"
              required
              value={formData.emailAddress}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emailAddress: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Configuración IMAP</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servidor IMAP
              </label>
              <input
                type="text"
                required
                value={formData.imapHost}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, imapHost: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Puerto
              </label>
              <input
                type="number"
                required
                value={formData.imapPort}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    imapPort: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Configuración SMTP</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servidor SMTP
              </label>
              <input
                type="text"
                required
                value={formData.smtpHost}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, smtpHost: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Puerto
              </label>
              <input
                type="number"
                required
                value={formData.smtpPort}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    smtpPort: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("provider")}
            className="flex-1"
          >
            Atrás
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Configurando...
              </>
            ) : (
              "Configurar cuenta"
            )}
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {step === "provider" && renderProviderSelection()}
        {step === "credentials" && renderCredentialsForm()}
        {step === "manual" && renderManualForm()}
      </div>
    </div>
  );
}
