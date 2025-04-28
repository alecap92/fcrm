import axios from "axios";
import { apiService } from "../config/apiConfig";

class ImportService {
  private static instance: ImportService;
  private baseUrl = "/import";

  private constructor() {}

  public static getInstance(): ImportService {
    if (!ImportService.instance) {
      ImportService.instance = new ImportService();
    }
    return ImportService.instance;
  }

  public async importContacts(formData: FormData): Promise<{
    success: number;
    failed: number;
    errors: Array<{ index: number; error: string }>;
  }> {
    // Usamos axios directamente porque apiService no tiene un método para
    // manejar FormData con Content-Type: multipart/form-data
    return axios.post(
      `${import.meta.env.VITE_API_BASE_URL}${this.baseUrl}/contacts`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      }
    );
  }
}

export const importService = ImportService.getInstance();
