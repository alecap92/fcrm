import { apiService } from "../config/apiConfig";
import axios from "axios";

const getOrganization = async () => {
  try {
    const response = await apiService.get(`/organizations/current`);
    return response;
  } catch (error) {
    console.error("Error getting organization:", error);
    throw error;
  }
};

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

const uploadLogo = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("logo", file);

    const token = localStorage.getItem("auth_token");
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/organizations/upload-logo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading logo:", error);
    throw error;
  }
};

const uploadIcon = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("icon", file);

    const token = localStorage.getItem("auth_token");
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/organizations/upload-icon`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading icon:", error);
    throw error;
  }
};

export const organizationService = {
  getOrganization,
  updateOrganization,
  uploadLogo,
  uploadIcon,
};
