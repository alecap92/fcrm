export type ProductVariant = {
  id: string;
  attributes: {
    [key: string]: string;
  };
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
};

export interface VariantId {
  attributeValues: {
    attributeName: string;
    displayName: string;
    imageUrl: string;
    price: number;
    value: string;
    valueId: string;
  }[],
  imageUrl: string, 
  isActive: boolean,
  organizationId: string, 
  price: number,
  productId: string,
  sku: string,
  userId: string,
  createdAt: string,
  updatedAt: string,
  _id: string,
}

export type ProductAttribute = {
  id: string;
  attributeName: string;
  value: string;
  price: number;
  imageUrl: string;
};

export type VariantPreview = {
  id: string;
  attributes: {
    [key: string]: string;
  };
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
};

export type SKUPattern = {
  template: string;
  separator: string;
};

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
  hasVariants?: boolean;
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  skuPattern?: SKUPattern;
  imageUrl?: string;
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