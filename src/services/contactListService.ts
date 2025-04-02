import { apiService } from "../config/apiConfig";
import { IContactList } from "../types/contactList";

const getContactList = async (): Promise<any> =>
  await apiService.get<IContactList[]>(`/lists`);

const getContactListById = async (id: string): Promise<any> =>
  await apiService.get<IContactList>(`/lists/${id}`);

const createContactList = async (
  contactList: Omit<IContactList, "id">
): Promise<IContactList> =>
  await apiService.post<IContactList>("/lists/static", contactList);

const updateContactList = async (
  id: string,
  contactList: Partial<IContactList>
): Promise<IContactList> =>
  await apiService.put<IContactList>(`/lists/${id}`, contactList);

const deleteContactList = async (id: string): Promise<void> =>
  await apiService.delete(`/lists/${id}`);

export const exportList = async (listId: string): Promise<void> => {
  try {
    const response = await apiService.get(`/lists/export/${listId}`, {
      responseType: "blob", // importante para manejar archivos binarios
    });

    const blob = new Blob([response.data as BlobPart], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `Lista-${listId}.xlsx`);
    document.body.appendChild(link);
    link.click();

    // Limpieza
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al exportar la lista:", error);
    // Puedes lanzar un toast o notificación de error aquí
  }
};

const contactListService = {
  getContactList,
  getContactListById,
  createContactList,
  updateContactList,
  deleteContactList,
  exportList,
};

export default contactListService;
