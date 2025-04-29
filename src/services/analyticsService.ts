import { apiService } from "../config/apiConfig";

const getAnalytics = async (startDate: string, endDate: string) => {
  const response = await apiService.get("/analytics", {
    params: {
      startDate,
      endDate,
    },
  });
  return response.data;
};

const analyticsService = {
  getAnalytics,
};

export default analyticsService;
