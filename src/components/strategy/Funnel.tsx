import React, { useEffect, useState } from "react";
import { initialFunnelData } from "../../constants/funnelData";
import { FunnelSection } from "../../types/strategy";
import FunnelVisualization from "./funnel/FunnelVisualization";
import ChannelList from "./funnel/ChannelList";
import ChannelDetails from "./funnel/ChannelDetails";
import { strategyService } from "../../services/strategyService";
import { useToast } from "../ui/toast";

const Funnel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<"tofu" | "mofu" | "bofu">(
    "tofu"
  );
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [disabledStrategies, setDisabledStrategies] = useState<Set<string>>(
    new Set()
  );
  const [funnelData, setFunnelData] = useState<FunnelSection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [strategyId, setStrategyId] = useState<string>("");
  const [strategyData, setStrategyData] = useState<any>(null);

  const toast = useToast();

  const handleSectionClick = (sectionId: "tofu" | "mofu" | "bofu") => {
    setActiveSection(sectionId);
    setActiveChannel(null);
  };

  const handleChannelClick = (channelName: string) => {
    setActiveChannel(channelName);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await strategyService.fetchData();
      console.log(data);
      if (data[0] && data[0].funnel && data[0].funnel.sections) {
        console.log(data[0].funnel.sections);
        setFunnelData(data[0].funnel.sections);
        setStrategyId(data[0]._id); // Guardar el ID de la estrategia
        setStrategyData(data[0]); // Guardar el objeto completo
      }
    } catch (error) {
      console.error("Error fetching funnel data:", error);
      // Usar datos iniciales como fallback en caso de error
      setFunnelData(initialFunnelData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleActivity = async (
    sectionId: string,
    channelName: string,
    activityIndex: number
  ) => {
    // Primero encontramos el estado actual de la actividad
    const currentSection = funnelData.find(
      (section) => section.id === sectionId
    );
    if (!currentSection) return;

    const currentChannel = currentSection.content.channels.find(
      (channel) => channel.name === channelName
    );
    if (!currentChannel) return;

    const currentActivity = currentChannel.keyActivities[activityIndex];
    const newCompletedState = !currentActivity.completed;

    // Actualizamos el estado local para UX inmediata
    const updatedFunnelData = funnelData.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          content: {
            ...section.content,
            channels: section.content.channels.map((channel) => {
              if (channel.name === channelName) {
                const updatedActivities = channel.keyActivities.map(
                  (activity, idx) =>
                    idx === activityIndex
                      ? { ...activity, completed: newCompletedState }
                      : activity
                );
                const completedCount = updatedActivities.filter(
                  (activity) => activity.completed
                ).length;
                const completionPercentage = Math.round(
                  (completedCount / updatedActivities.length) * 100
                );

                return {
                  ...channel,
                  keyActivities: updatedActivities,
                  completionPercentage,
                };
              }
              return channel;
            }),
          },
        };
      }
      return section;
    });

    // Actualizamos el estado local
    setFunnelData(updatedFunnelData);

    // Actualizamos el objeto de estrategia completo
    if (strategyData && strategyId) {
      const updatedStrategyData = {
        ...strategyData,
        funnel: {
          ...strategyData.funnel,
          sections: updatedFunnelData,
        },
      };

      // Actualizamos la referencia del objeto de estrategia
      setStrategyData(updatedStrategyData);

      // Enviamos el objeto completo a la API
      try {
        await strategyService.updateStrategy(strategyId, updatedStrategyData);
        toast.show({
          title: "Embudo actualizado",
          description: "El embudo se ha actualizado correctamente",
          type: "success",
        });
      } catch (error) {
        console.error("Error al actualizar estrategia:", error);
        toast.show({
          title: "Error al actualizar estrategia",
          description: "El embudo no se ha actualizado correctamente",
          type: "error",
        });
      }
    }
  };

  const toggleStrategy = (sectionId: string, channelName: string) => {
    const strategyKey = `${sectionId}-${channelName}`;
    setDisabledStrategies((prev) => {
      const newDisabled = new Set(prev);
      if (newDisabled.has(strategyKey)) {
        newDisabled.delete(strategyKey);
      } else {
        newDisabled.add(strategyKey);
        setFunnelData((prevData) => {
          return prevData.map((section) => {
            if (section.id === sectionId) {
              return {
                ...section,
                content: {
                  ...section.content,
                  channels: section.content.channels.map((channel) => {
                    if (channel.name === channelName) {
                      return {
                        ...channel,
                        keyActivities: channel.keyActivities.map(
                          (activity) => ({
                            ...activity,
                            completed: false,
                          })
                        ),
                        completionPercentage: 0,
                      };
                    }
                    return channel;
                  }),
                },
              };
            }
            return section;
          });
        });
      }
      return newDisabled;
    });
  };

  const isStrategyDisabled = (sectionId: string, channelName: string) => {
    return disabledStrategies.has(`${sectionId}-${channelName}`);
  };

  if (isLoading) {
    return <div className="text-center py-6">Cargando datos del embudo...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Análisis del Embudo de Marketing
      </h2>
      <div className="flex items-start space-x-8">
        <FunnelVisualization
          funnelData={funnelData}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />

        <ChannelList
          activeSection={activeSection}
          activeChannel={activeChannel}
          funnelData={funnelData}
          onChannelClick={handleChannelClick}
          isStrategyDisabled={isStrategyDisabled}
        />

        <ChannelDetails
          activeSection={activeSection}
          activeChannel={activeChannel}
          funnelData={funnelData}
          isStrategyDisabled={isStrategyDisabled}
          onToggleActivity={toggleActivity}
          onToggleStrategy={toggleStrategy}
        />
      </div>
    </div>
  );
};

export default Funnel;
