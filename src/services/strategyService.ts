import { apiService } from "../config/apiConfig";

const fetchData = async () => {
  const response: any = await apiService.get("/strategies");
  return response.data.data;
};

const updateFunnelActivity = async (
  strategyId: string,
  sectionId: string,
  channelName: string,
  activityIndex: number,
  completed: boolean
) => {
  const response: any = await apiService.put(
    `/strategies/${strategyId}/funnel/activity`,
    {
      sectionId,
      channelName,
      activityIndex,
      completed,
    }
  );
  return response.data;
};

const updateStrategy = async (strategyId: string, strategyData: any) => {
  const response: any = await apiService.put(
    `/strategies/${strategyId}`,
    strategyData
  );
  return response.data;
};

export const strategyService = {
  fetchData,
  updateFunnelActivity,
  updateStrategy,
};
