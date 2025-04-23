import { apiService } from "../config/apiConfig";
import type { Product } from "../types/product";

interface ProductResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
  totalProducts: number;
}


const getProducts = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await apiService.get<ProductResponse>(
      `/products?page=${page}&limit=${limit}`
    );


    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

const getProductById = async (id: string) => {
  try {
    const response = await apiService.get<Product>(`/products/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

const searchProducts = async (search: string) => {
  try {
    const response = await apiService.get<ProductResponse>(
      `/products/search?term=${encodeURIComponent(search)}`
    );
    return response;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

const createProduct = async (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
  try {
    const response = await apiService.post<Product>("/products", product);
    return response;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

const updateProduct = async (id: string, product: Partial<Product>) => {
  

  try {
    const response = await apiService.put<Product>(`/products/${id}`, product);
    return response;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

const deleteProduct = async (id: string) => {
  try {
    await apiService.delete(`/products/${id}`);
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

const bulkDeleteProducts = async (ids: string[]) => {
  try {
    await apiService.delete('/products', { ids });
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    throw error;
  }
};

const updateProductStock = async (id: string, quantity: number) => {
  if (quantity < 0) {
    throw new Error('Quantity must be a positive number');
  }

  try {
    const response = await apiService.put<Product>(`/products/${id}/stock`, {
      quantity,
    });
    return response;
  } catch (error) {
    console.error(`Error updating product ${id} stock:`, error);
    throw error;
  }
};

const getProductsByCategory = async (categoryId: string, page: number = 1, limit: number = 10) => {
  try {
    const response = await apiService.get<ProductResponse>(
      `/products/category/${categoryId}?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error;
  }
};

const getProductsByTag = async (tag: string, page: number = 1, limit: number = 10) => {
  try {
    const response = await apiService.get<ProductResponse>(
      `/products/tag/${encodeURIComponent(tag)}?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error(`Error fetching products for tag ${tag}:`, error);
    throw error;
  }
};

const getOutOfStockProducts = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await apiService.get<ProductResponse>(
      `/products/out-of-stock?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching out of stock products:', error);
    throw error;
  }
};

const getLowStockProducts = async (threshold: number = 10, page: number = 1, limit: number = 10) => {
  try {
    const response = await apiService.get<ProductResponse>(
      `/products/low-stock?threshold=${threshold}&page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw error;
  }
};

const getProductVariants = async (id: string) => {
  try {
    const response = await apiService.get<any>(`/products/${id}/variants`);
    return response;
  } catch (error) { 
    console.error(`Error fetching product variants ${id}:`, error);
    throw error;
  }
};


const productsService = {
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  updateProductStock,
  getProductsByCategory,
  getProductsByTag,
  getOutOfStockProducts,
  getLowStockProducts,
  getProductVariants
};

export default productsService;