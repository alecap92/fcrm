import React from "react";
import { FunnelSection } from "../../../types/strategy";

interface ChannelListProps {
  activeSection: "tofu" | "mofu" | "bofu";
  activeChannel: string | null;
  funnelData: FunnelSection[];
  onChannelClick: (channelName: string) => void;
  isStrategyDisabled: (sectionId: string, channelName: string) => boolean;
}

const ChannelList: React.FC<ChannelListProps> = ({
  activeSection,
  activeChannel,
  funnelData,
  onChannelClick,
  isStrategyDisabled,
}) => {
  const currentSection = funnelData.find(
    (section) => section.id === activeSection
  );

  if (!currentSection) return null;

  return (
    <div className="w-[35%] sticky top-24">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-white/10 text-white">
        <h3 className="text-xl font-semibold mb-2">
          {currentSection.content.title}
        </h3>
        <p className="text-gray-300 mb-6">
          {currentSection.content.description}
        </p>
        <div className="space-y-4">
          {currentSection.content.channels.map((channel, index) => (
            <button
              key={index}
              onClick={() => onChannelClick(channel.name)}
              className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                activeChannel === channel.name
                  ? "border-action bg-action/20"
                  : "border-white/10 hover:border-white/30 hover:bg-white/5"
              } ${
                isStrategyDisabled(activeSection, channel.name)
                  ? "opacity-50"
                  : ""
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">{channel.name}</span>
                <span className="text-gray-300">
                  {channel.completionPercentage}%
                </span>
              </div>
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        channel.completionPercentage > 0
                          ? "bg-action"
                          : "bg-white/5"
                      }`}
                      style={{
                        width: `${
                          channel.completionPercentage > 0
                            ? channel.completionPercentage
                            : 100
                        }%`,
                        opacity: channel.completionPercentage > 0 ? 1 : 0.3,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChannelList;
