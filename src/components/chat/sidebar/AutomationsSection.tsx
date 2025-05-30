import React, { useState, useEffect } from "react";
import { Bot, Clock, Pause, Play } from "lucide-react";
import {
  pauseAutomations,
  resumeAutomations,
  getAutomationStatus,
  AutomationSettings,
} from "../../../services/automationService";

interface AutomationsSectionProps {
  conversationId: string;
}

export const AutomationsSection: React.FC<AutomationsSectionProps> = ({
  conversationId,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [automationSettings, setAutomationSettings] =
    useState<AutomationSettings>({
      isPaused: false,
      automationHistory: [],
    });

  // Cargar el estado inicial de automatizaciones
  useEffect(() => {
    const loadAutomationStatus = async () => {
      try {
        const response = await getAutomationStatus(conversationId);
        if (response.success && response.data.automationSettings) {
          setAutomationSettings(response.data.automationSettings);
        }
      } catch (error) {
        console.error("Error cargando estado de automatizaciones:", error);
      }
    };

    if (conversationId) {
      loadAutomationStatus();
    }
  }, [conversationId]);

  const getButtonText = () => {
    if (automationSettings.isPaused) {
      if (automationSettings.pausedUntil) {
        const now = new Date();
        const pausedUntil = new Date(automationSettings.pausedUntil);
        if (pausedUntil > now) {
          return "Pausado";
        }
      }
      return "Pausado para Siempre";
    }
    return "Pausar";
  };

  const getButtonIcon = () => {
    return automationSettings.isPaused ? (
      <Pause className="w-4 h-4" />
    ) : (
      <Play className="w-4 h-4" />
    );
  };

  const handleDurationSelect = async (duration: string) => {
    setLoading(true);
    try {
      let response;

      if (duration === "resume") {
        response = await resumeAutomations(conversationId);
      } else {
        response = await pauseAutomations(conversationId, duration);
      }

      if (response.success && response.data.automationSettings) {
        setAutomationSettings(response.data.automationSettings);
      }

      setShowDropdown(false);
    } catch (error) {
      console.error("Error actualizando automatizaciones:", error);
      // Aquí podrías mostrar un toast de error
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (automationSettings.isPaused) {
      // Si está pausado, reanudar directamente
      handleDurationSelect("resume");
    } else {
      // Si está activo, mostrar dropdown para pausar
      setShowDropdown(!showDropdown);
    }
  };

  const durationOptions = [
    { label: "30 minutos", value: "30m" },
    { label: "1 hora", value: "1h" },
    { label: "3 horas", value: "3h" },
    { label: "6 horas", value: "6h" },
    { label: "12 horas", value: "12h" },
    { label: "1 día", value: "1d" },
  ];

  return (
    <div className="border-b border-gray-200 pb-4 px-4">
      <div className="flex items-center">
        <Bot className="w-4 h-4 text-gray-500 mr-2" />
        <div className="flex flex-col py-3">
          <h3 className="font-semibold text-gray-900">Automatizaciones</h3>
        </div>
      </div>
      <div className="flex flex-col relative">
        <button
          className={`w-full px-3 py-2 border rounded-lg text-sm flex items-center justify-between transition-colors ${
            automationSettings.isPaused
              ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
              : "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleButtonClick}
          disabled={loading}
        >
          <span className="flex items-center">
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              getButtonIcon()
            )}
            <span className="ml-2">{getButtonText()}</span>
          </span>
          {!automationSettings.isPaused && <Clock className="w-4 h-4" />}
        </button>

        {showDropdown && !automationSettings.isPaused && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Establecer duración
              </div>
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center transition-colors"
                  onClick={() => handleDurationSelect(option.value)}
                  disabled={loading}
                >
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  {option.label}
                </button>
              ))}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center transition-colors"
                  onClick={() => handleDurationSelect("forever")}
                  disabled={loading}
                >
                  <Pause className="w-4 h-4 text-red-500 mr-2" />
                  Pausar para siempre
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overlay para cerrar el dropdown al hacer click fuera */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      {/* Mostrar información adicional si está pausado */}
      {automationSettings.isPaused && automationSettings.pausedUntil && (
        <div className="mt-2 text-xs text-gray-500">
          Pausado hasta:{" "}
          {new Date(automationSettings.pausedUntil).toLocaleString("es-ES")}
        </div>
      )}
    </div>
  );
};

export default AutomationsSection;
