import { apiService } from "../config/apiConfig";
import type {
  Contact,
  PaginationParams,
  PaginatedResponse,
} from "../types/contact";

class ContactsService {
  private static instance: ContactsService;
  private baseUrl = "/contacts";

  private constructor() {}

  public static getInstance(): ContactsService {
    if (!ContactsService.instance) {
      ContactsService.instance = new ContactsService();
    }
    return ContactsService.instance;
  }

  public async getContacts(pagination?: PaginationParams): Promise<any> {
    return apiService.get<PaginatedResponse<Contact>>(
      `${this.baseUrl}?limit=${pagination?.limit}&page=${pagination?.page}`
    );
  }

  public async getContactById(id: string): Promise<any> {
    return apiService.get<Contact>(`${this.baseUrl}/${id}`);
  }

  public async createContact(
    contact: Omit<Contact, "id" | "createdAt" | "updatedAt">
  ): Promise<Contact> {
    return apiService.post<Contact>(this.baseUrl, contact);
  }

  public async updateContact(id: string, contact: any): Promise<Contact> {
    console.log(contact);
    return apiService.put<Contact>(`${this.baseUrl}/${id}`, contact);
  }

  public async deleteContact(id: string): Promise<void> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  public async searchContacts(query: string): Promise<any> {
    return apiService.get(`${this.baseUrl}/search`, {
      params: {
        search: query,
      },
    });
  }

  public async bulkDeleteContacts(ids: string[]): Promise<void> {
    console.log(ids);
    return apiService.delete(`${this.baseUrl}/`, { ids });
  }

  public async bulkUpdateTags(
    ids: string[],
    tags: string[],
    action: "add" | "remove"
  ): Promise<void> {
    return apiService.post(`${this.baseUrl}/bulk-update-tags`, {
      ids,
      tags,
      action,
    });
  }

  public async importContacts(
    contacts: Array<Omit<Contact, "id" | "createdAt" | "updatedAt">>
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ index: number; error: string }>;
  }> {
    return apiService.post(`${this.baseUrl}/import`, { contacts });
  }

  public async filterContacts(
    filters: Record<string, any>
  ): Promise<PaginatedResponse<Contact>> {
    return apiService.post<PaginatedResponse<Contact>>(
      `${this.baseUrl}/filter`,
      filters
    );
  }
}

export const contactsService = ContactsService.getInstance();
