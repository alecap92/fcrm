import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import Funnel from "../components/strategy/Funnel";
import Audience from "../components/strategy/Audience";
import Budget from "../components/strategy/Budget";
import { AudienceType } from "../types/strategy";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";

const Strategy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"funnel" | "audience" | "budget">(
    "funnel"
  );
  const [audienceData, setAudienceData] = useState<AudienceType[]>([]);
  const navigate = useNavigate();
  const { organization } = useAuth();

  // Verificar si hay configuración básica de organización
  const hasBasicConfig = organization?.companyName && organization?.settings;

  // Si no hay configuración básica, mostrar mensaje de configuración
  if (!hasBasicConfig) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full mx-4">
          <div className="text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Configuración Requerida
            </h2>
            <p className="text-gray-600 mb-6">
              Para gestionar estrategias de marketing necesitas configurar
              primero tu organización. Esto incluye información básica de la
              empresa y configuraciones generales necesarias para crear y
              gestionar funnels de marketing y análisis de audiencia.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Configura la organización para empezar a crear estrategias de
                marketing
              </p>
              <Button onClick={() => navigate("/settings")} className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Ir a Configuración
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 border-b border-gray-200/20">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("funnel")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "funnel"
                  ? "border-action text-action"
                  : "border-transparent text-gray-300 hover:text-white hover:border-gray-300"
              }`}
            >
              Funnel de Marketing
            </button>
            <button
              onClick={() => setActiveTab("audience")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "audience"
                  ? "border-action text-action"
                  : "border-transparent text-gray-300 hover:text-white hover:border-gray-300"
              }`}
            >
              Audience
            </button>
            <button
              onClick={() => setActiveTab("budget")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "budget"
                  ? "border-action text-action"
                  : "border-transparent text-gray-300 hover:text-white hover:border-gray-300"
              }`}
            >
              Presupuesto
            </button>
          </nav>
        </div>

        {activeTab === "funnel" && <Funnel />}
        {activeTab === "audience" && (
          <Audience
            audienceData={audienceData}
            setAudienceData={setAudienceData}
          />
        )}
        {activeTab === "budget" && <Budget />}
      </div>
    </div>
  );
};

export default Strategy;
