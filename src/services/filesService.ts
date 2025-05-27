import { apiService } from "../config/apiConfig";

export interface FileDocument {
  _id: string;
  name: string;
  fileType: string;
  mediaURL: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

const getFiles = async (params: {
  isVisible: boolean;
}): Promise<FileDocument[]> => {
  const response = await apiService.get("/files", { params });
  return response.data as FileDocument[];
};

const fileService = {
  getFiles,
};

export default fileService;
