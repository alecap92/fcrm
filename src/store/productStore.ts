import { create } from 'zustand';
import type { Product, ProductCategory, ProductFilter } from '../types/product';

interface ProductState {
  products: Product[];
  categories: ProductCategory[];
  filters: ProductFilter;
  selectedProduct: Product | null;
  setProducts: (products: Product[]) => void;
  setCategories: (categories: ProductCategory[]) => void;
  setFilters: (filters: ProductFilter) => void;
  setSelectedProduct: (product: Product | null) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [
    {
      id: '1',
      name: 'Basic T-Shirt',
      description: 'Comfortable cotton t-shirt',
      sku: 'TS-001',
      price: 19.99,
      compareAtPrice: 24.99,
      cost: 8.50,
      quantity: 100,
      category: 'Clothing',
      tags: ['apparel', 'basics'],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
          alt: 'Basic T-Shirt'
        }
      ],
      variants: [
        {
          id: '1-1',
          name: 'Small / White',
          sku: 'TS-001-S-W',
          price: 19.99,
          quantity: 30,
          attributes: {
            size: 'Small',
            color: 'White'
          }
        },
        {
          id: '1-2',
          name: 'Medium / White',
          sku: 'TS-001-M-W',
          price: 19.99,
          quantity: 40,
          attributes: {
            size: 'Medium',
            color: 'White'
          }
        }
      ],
      attributes: {
        material: 'Cotton',
        brand: 'Basic Co.'
      },
      status: 'active',
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2024-03-15T15:30:00Z'
    },
    {
      id: '2',
      name: 'Premium Hoodie',
      description: 'High-quality cotton blend hoodie',
      sku: 'HD-001',
      price: 49.99,
      compareAtPrice: 59.99,
      cost: 22.50,
      quantity: 75,
      category: 'Clothing',
      tags: ['apparel', 'premium'],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
          alt: 'Premium Hoodie'
        }
      ],
      status: 'active',
      createdAt: '2024-03-05T09:00:00Z',
      updatedAt: '2024-03-15T16:45:00Z'
    }
  ],

  categories: [
    {
      id: '1',
      name: 'Clothing',
      description: 'Apparel and accessories',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop'
    },
    {
      id: '2',
      name: 'Electronics',
      description: 'Gadgets and devices',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop'
    }
  ],

  filters: {},
  selectedProduct: null,

  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setFilters: (filters) => set({ filters }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),

  addProduct: (product) => set((state) => ({
    products: [...state.products, {
      ...product,
      id: `product_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }]
  })),

  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map((product) =>
      product.id === id
        ? { ...product, ...updates, updatedAt: new Date().toISOString() }
        : product
    )
  })),

  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((product) => product.id !== id)
  })),
}));