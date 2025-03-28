export interface IContact {
  properties: [
    {
      key: string;
      value: string;
    }
  ];
}

export interface Contact {
  id: string;
  firstName?: string;
  organizationId?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
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
}
