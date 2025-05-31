import axios from "axios";
import { apiService } from "../config/apiConfig";

const getDocuments = async (organizationId?: string) => {
  try {
    const params = organizationId ? { organizationId } : {};
    const response = await apiService.get(`/documents`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

const uploadDocument = async (formData: any) => {
  try {
    console.log(formData);
    const response: any = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/documents`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

const deleteDocument = async (id: string) => {
  try {
    const response: any = await apiService.delete(`/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

const documentsService = {
  getDocuments,
  uploadDocument,
  deleteDocument,
};

export default documentsService;
