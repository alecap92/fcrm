export type Product = {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price_amount: string;
  unitPrice?: number;
  code: string;
  type_item_identification_id: number;
  taxes?: number;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
};

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
  status?: any;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  tags?: string[];
}