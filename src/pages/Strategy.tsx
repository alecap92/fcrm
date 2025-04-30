import React, { useState } from "react";
import Funnel from "../components/strategy/Funnel";
import Audience from "../components/strategy/Audience";
import Budget from "../components/strategy/Budget";
import { AudienceType } from "../types/strategy";

const Strategy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"funnel" | "audience" | "budget">(
    "funnel"
  );
  const [audienceData, setAudienceData] = useState<AudienceType[]>([]);

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
