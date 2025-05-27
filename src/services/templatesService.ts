import { apiService } from "../config/apiConfig";
import { ITemplate } from "../types/templates";

interface Template {
  id: string;
  name: string;
  text: string;
}

interface TemplateResponse {
  templates: Template[];
  total: number;
  currentPage: number;
}

const getTemplates = async (page: number = 1, limit: number = 5) => {
  try {
    const response = await apiService.get<TemplateResponse>(
      `/chat/templates?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
};

const getTemplateById = async (id: string) => {
  try {
    const response = await apiService.get<Template>(`/templates/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching template ${id}:`, error);
    throw error;
  }
};

const searchTemplates = async (search: string) => {
  try {
    const response = await apiService.get<TemplateResponse>(
      `/templates/search?term=${encodeURIComponent(search)}`
    );
    return response;
  } catch (error) {
    console.error("Error searching templates:", error);
    throw error;
  }
};

const sendTemplate = async (template: ITemplate, phoneNumber: string) => {
  try {
    const response = await apiService.post<any>("/chat/send-template", {
      template,
      phoneNumber,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending template:", error);
    throw error;
  }
};

const templatesService = {
  getTemplates,
  getTemplateById,
  searchTemplates,
  sendTemplate,
};

export default templatesService;
