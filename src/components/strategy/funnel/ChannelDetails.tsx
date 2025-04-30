import React from "react";
import { Check, X } from "lucide-react";
import { FunnelSection } from "../../../types/strategy";

interface ChannelDetailsProps {
  activeSection: "tofu" | "mofu" | "bofu";
  activeChannel: string | null;
  funnelData: FunnelSection[];
  isStrategyDisabled: (sectionId: string, channelName: string) => boolean;
  onToggleActivity: (
    sectionId: string,
    channelName: string,
    activityIndex: number
  ) => void;
  onToggleStrategy: (sectionId: string, channelName: string) => void;
}

const ChannelDetails: React.FC<ChannelDetailsProps> = ({
  activeSection,
  activeChannel,
  funnelData,
  isStrategyDisabled,
  onToggleActivity,
  onToggleStrategy,
}) => {
  if (!activeSection || !activeChannel) return null;

  const currentChannel = funnelData
    .find((section) => section.id === activeSection)
    ?.content.channels.find((channel) => channel.name === activeChannel);

  if (!currentChannel) return null;

  return (
    <div className="w-[35%] sticky top-24">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-white/10 text-white">
        <h3 className="text-xl font-semibold mb-4">{activeChannel}</h3>
        <div className="space-y-6">
          <div>
            <p className="text-gray-300">{currentChannel.description}</p>
          </div>
          <div>
            <h4
              className={`text-lg font-medium mb-3 ${
                isStrategyDisabled(activeSection, activeChannel)
                  ? "text-gray-500"
                  : "text-white"
              }`}
            >
              Actividades clave:
            </h4>
            <ul className="space-y-3">
              {currentChannel.keyActivities.map((activity, index) => (
                <li
                  key={index}
                  className={`flex items-start p-2 rounded transition-colors duration-200 ${
                    activity.completed ? "bg-white/5" : ""
                  } ${
                    isStrategyDisabled(activeSection, activeChannel)
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  <button
                    onClick={() =>
                      onToggleActivity(activeSection, activeChannel, index)
                    }
                    disabled={isStrategyDisabled(activeSection, activeChannel)}
                    className={`flex items-center justify-center w-5 h-5 rounded border ${
                      activity.completed
                        ? "bg-action border-action text-white"
                        : "border-gray-400"
                    } mr-3 transition-colors duration-200`}
                  >
                    {activity.completed && <Check size={14} />}
                  </button>
                  <span
                    className={`text-gray-300 ${
                      activity.completed ? "line-through opacity-60" : ""
                    }`}
                  >
                    {activity.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => onToggleStrategy(activeSection, activeChannel)}
            className={`mt-6 w-full py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
              isStrategyDisabled(activeSection, activeChannel)
                ? "bg-emerald-700/20 text-emerald-400 border border-emerald-700/50 hover:bg-emerald-700/30"
                : "bg-red-700/20 text-red-400 border border-red-700/50 hover:bg-red-700/30"
            }`}
          >
            <X size={16} />
            <span>
              {isStrategyDisabled(activeSection, activeChannel)
                ? "Enable strategy"
                : "This strategy is not for me"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelDetails;
