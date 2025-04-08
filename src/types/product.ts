export interface Product {
  _id: string;
  name: string;
  description?: string;
  unitPrice: number;
  imageUrl?: string;
  taxes?: number;
  organizationId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  image?: string;
}

export interface ProductFilter {
  search?: string;
  categories?: string[];
  status?: Product['status'][];
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  tags?: string[];
}