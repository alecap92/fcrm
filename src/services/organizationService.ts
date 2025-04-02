import { apiService } from "../config/apiConfig";

const updateOrganization = async (organizationData: any) => {
  try {
    const response = await apiService.put(`/organizations`, organizationData);
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error updating organization:", error);
    throw error;
  }
};

export const organizationService = {
  updateOrganization,
};
