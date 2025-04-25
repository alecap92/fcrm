export interface IContact {
  properties: [
    {
      key: string;
      value: string;
    }
  ];
}

export interface Contact {
  _id: string;
  firstName?: string;
  organizationId?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  companyType?: string;
  idNumber?: string;
  position?: string;
  city?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  taxId: string;
  mobile?: string;
  idType?: string;
  website?: string;
  dv?: string | undefined;
  notas?: string;
  lifeCycle?: string;
}

export interface ContactFilters {
  search?: string;
  tags?: string[];
  company?: string;
  createdAfter?: string;
  createdBefore?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Add these types to the existing contact.ts file

export interface FilterCondition {
  id: string;
  key: string;
  operator: string;
  value: string;
  group?: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  conditions: FilterCondition[];
}

export interface IContactDetails {
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  companyName: string;
  idType: string;
  idNumber: string;
  companyType: string;
  totalIncome: string;
  price: string;
  lifeCycle: string;
  source: string;
  dv: string;
}

export interface Activity {
  _id: string;
  activityType: "Reunion" | "Llamada" | "Correo" | "Nota";
  title: string;
  date: string;
  notes: string;
  status: string;
  organizationId: string;
  ownerId: string;
  contactId: string;
  createdAt: string;
  updatedAt: string;
  reminder: string;
}
