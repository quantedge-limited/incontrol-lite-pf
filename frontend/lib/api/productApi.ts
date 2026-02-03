// productApi.ts - UPDATED VERSION
import { inventoryApi } from './inventoryApi';

export interface FrontendProduct {
  id: number;  // Changed from string
  name: string;
  price: number;
  description?: string;
  quantity: number;
  image?: string;
  category?: string;
  inStock: boolean;
  is_active: boolean;
}

export const productApi = {
  // Get products for customers (public endpoint)
  async getCustomerProducts(): Promise<FrontendProduct[]> {
    try {
      const products = await inventoryApi.getProducts({ is_active: true });
      
      return products.map((item) => ({
        id: item.id,
        name: item.brand_name,
        price: parseFloat(item.selling_price.toString()),
        description: item.description,
        quantity: item.stock_qty,
        image: item.image ? 
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${item.image}` : 
          undefined,
        category: item.category_name,
        inStock: item.stock_qty > 0 && item.is_active,
        is_active: item.is_active,
      }));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  },

  // Get single product for customers
  async getCustomerProduct(id: number): Promise<FrontendProduct> {
    const product = await inventoryApi.getProduct(id);
    
    return {
      id: product.id,
      name: product.brand_name,
      price: parseFloat(product.selling_price.toString()),
      description: product.description,
      quantity: product.stock_qty,
      image: product.image ? 
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${product.image}` : 
        undefined,
      category: product.category_name,
      inStock: product.stock_qty > 0 && product.is_active,
      is_active: product.is_active,
    };
  },

  // Get products for admin (use inventoryApi instead)
  async list() {
    return inventoryApi.getProducts();
  },

  // Get single product for admin
  async get(id: number) {
    return inventoryApi.getProduct(id);
  },
};