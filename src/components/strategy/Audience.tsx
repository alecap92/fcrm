import React, { useState } from "react";
import { Plus, Info, CheckCircle2, Circle, ChevronRight } from "lucide-react";
import {
  AudienceType,
  AudienceSection,
  AudienceItem,
} from "../../types/strategy";
import { initialFunnelData } from "../../constants/funnelData";

interface AudienceProps {
  audienceData: AudienceType[];
  setAudienceData: React.Dispatch<React.SetStateAction<AudienceType[]>>;
}

const Audience: React.FC<AudienceProps> = ({
  audienceData,
  setAudienceData,
}) => {
  const [activeAudience, setActiveAudience] = useState<string>(
    audienceData && audienceData.length > 0 ? audienceData[0]?.id || "" : ""
  );
  const [activeSection, setActiveSection] = useState<string>("demographics");
  const [showNewAudienceModal, setShowNewAudienceModal] = useState(false);
  const [newAudienceName, setNewAudienceName] = useState("");
  const [newAudienceDescription, setNewAudienceDescription] = useState("");
  const [showTip, setShowTip] = useState<string | null>(null);

  const calculateSectionProgress = (section: AudienceSection) => {
    const completedItems = section.items.filter(
      (item) => item.completed
    ).length;
    return Math.round((completedItems / section.items.length) * 100);
  };

  const toggleAudienceItem = (
    audienceId: string,
    sectionId: string,
    itemIndex: number
  ) => {
    setAudienceData((prevData) => {
      return prevData.map((audience) => {
        if (audience.id === audienceId) {
          return {
            ...audience,
            sections: audience.sections.map((section) => {
              if (section.id === sectionId) {
                return {
                  ...section,
                  items: section.items.map((item, idx) =>
                    idx === itemIndex
                      ? { ...item, completed: !item.completed }
                      : item
                  ),
                };
              }
              return section;
            }),
          };
        }
        return audience;
      });
    });
  };

  const handleCreateAudience = () => {
    if (!newAudienceName.trim()) return;

    const newAudience: AudienceType = {
      id: Date.now().toString(),
      name: newAudienceName,
      description: newAudienceDescription,
      createdAt: new Date(),
      sections: JSON.parse(JSON.stringify(initialFunnelData)),
    };

    setAudienceData((prev) => [...prev, newAudience]);
    setActiveAudience(newAudience.id);
    setShowNewAudienceModal(false);
    setNewAudienceName("");
    setNewAudienceDescription("");
  };

  const currentAudience = audienceData?.find((a) => a.id === activeAudience);
  const currentSection = currentAudience?.sections.find(
    (s) => s.id === activeSection
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Análisis de Audiencia
      </h2>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowNewAudienceModal(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Create New Audience
          </button>
        </div>

        <div className="flex items-start space-x-8">
          {/* Audience List */}
          <div className="w-[20%]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Audiences
              </h3>
              <div className="space-y-3">
                {audienceData?.map((audience) => (
                  <button
                    key={audience.id}
                    onClick={() => setActiveAudience(audience.id)}
                    className={`w-full p-3 text-left rounded-lg transition-all duration-200 ${
                      activeAudience === audience.id
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {audience.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {audience.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="w-[35%]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Define Your Audience
              </h3>
              <div className="space-y-4">
                {currentAudience?.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                      activeSection === section.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {section.title}
                      </span>
                      <div className="flex items-center">
                        <span className="text-gray-600 dark:text-gray-400 mr-2">
                          {calculateSectionProgress(section)}%
                        </span>
                        <ChevronRight
                          size={16}
                          className={`transform transition-transform ${
                            activeSection === section.id ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 dark:bg-blue-600 rounded-full transition-all duration-300"
                        style={{
                          width: `${calculateSectionProgress(section)}%`,
                        }}
                      ></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section Details */}
          <div className="w-[45%]">
            {currentSection && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentSection.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {currentSection.description}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setShowTip(showTip ? null : currentSection.id)
                    }
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Info size={20} />
                  </button>
                </div>

                {showTip === currentSection.id && currentSection.tips && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                      Tips
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {currentSection.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="text-sm text-blue-600 dark:text-blue-300"
                        >
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4">
                  {currentSection.items.map((item: AudienceItem, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-start">
                        <button
                          onClick={() =>
                            toggleAudienceItem(
                              activeAudience,
                              currentSection.id,
                              index
                            )
                          }
                          className="mt-1"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="text-blue-500" size={20} />
                          ) : (
                            <Circle className="text-gray-400" size={20} />
                          )}
                        </button>
                        <div className="ml-3 flex-1">
                          <h4 className="text-gray-900 dark:text-white font-medium">
                            {item.name}
                          </h4>
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {item.description}
                            </p>
                          )}
                          {item.examples && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Examples:{" "}
                              </span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {item.examples.map((example, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                                  >
                                    {example}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Audience Modal */}
        {showNewAudienceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px]">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Create New Audience
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Audience Name
                  </label>
                  <input
                    type="text"
                    value={newAudienceName}
                    onChange={(e) => setNewAudienceName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Enterprise Decision Makers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newAudienceDescription}
                    onChange={(e) => setNewAudienceDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Describe your target audience"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowNewAudienceModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAudience}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Create Audience
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Audience;
