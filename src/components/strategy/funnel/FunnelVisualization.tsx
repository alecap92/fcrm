import React from "react";
import { ChevronRight } from "lucide-react";
import { FunnelSection } from "../../../types/strategy";

interface FunnelVisualizationProps {
  funnelData: FunnelSection[];
  activeSection: string;
  onSectionClick: (sectionId: "tofu" | "mofu" | "bofu") => void;
}

const FunnelVisualization: React.FC<FunnelVisualizationProps> = ({
  funnelData,
  activeSection,
  onSectionClick,
}) => {
  const calculateSectionOptimization = (section: FunnelSection) => {
    const totalActivities = section.content.channels.reduce(
      (sum, channel) => sum + channel.keyActivities.length,
      0
    );

    const completedActivities = section.content.channels.reduce(
      (sum, channel) =>
        sum +
        channel.keyActivities.filter((activity) => activity.completed).length,
      0
    );

    return totalActivities > 0
      ? Math.round((completedActivities / totalActivities) * 100)
      : 0;
  };

  return (
    <div className="w-[30%] flex flex-col items-center space-y-4">
      {funnelData.map((section, index) => {
        const optimizationPercentage = calculateSectionOptimization(section);

        return (
          <div key={section.id} className="w-full relative group">
            <button
              onClick={() => onSectionClick(section.id)}
              className={`w-full h-[160px] transition-all duration-300 relative ${
                activeSection === section.id
                  ? "opacity-100 scale-105"
                  : "opacity-60 hover:opacity-80"
              }`}
            >
              <div
                className={`
                  absolute inset-0 ${section.color}
                  ${
                    index === 0
                      ? "funnel-shape-top"
                      : index === 1
                      ? "funnel-shape-middle"
                      : "funnel-shape-bottom"
                  }
                `}
              >
                <div
                  className="absolute inset-0 bg-black bg-opacity-50"
                  style={{ width: `${100 - optimizationPercentage}%` }}
                ></div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="font-semibold text-lg z-10">
                  {section.title}
                </span>
                <span className="text-sm font-medium mt-2 bg-black bg-opacity-30 px-3 py-1 rounded-full">
                  {optimizationPercentage}% optimized
                </span>
              </div>
            </button>
            {activeSection === section.id && (
              <div className="absolute top-1/2 -right-8 -translate-y-1/2 text-gray-400">
                <ChevronRight size={24} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FunnelVisualization;
