export interface IContactList {
  _id: string;
  name: string;
  description: string;
  filter: string;
  contactIds: string[];
  isDynamic: boolean;
  userId: false;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
