import { apiService } from "../config/apiConfig";
import { IContactList } from "../types/contactList";

const getContactList = async (): Promise<IContactList[]> =>
  await apiService.get<IContactList[]>(`/lists`);

const getContactListById = async (id: string): Promise<IContactList> =>
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

const contactListService = {
  getContactList,
  getContactListById,
  createContactList,
  updateContactList,
  deleteContactList,
};

export default contactListService;
