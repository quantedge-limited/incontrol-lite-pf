// lib/api/productApi.ts - UPDATED
import { authApi } from './authApi';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com/api';

export interface Product {
  id: string;
  brand_name: string;  // Changed from "name"
  description?: string;
  quantity_in_stock: number;  // Changed from "quantity"
  selling_price: number;  // Changed from "price"
  cost_price: number;  // New field
  image?: string;  // Changed from "images"
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
}

// For frontend/customer display
export interface FrontendProduct {
  id: string;
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
      const res = await fetch(`${API_BASE}/inventory/items/`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch products (${res.status})`);
      }

      const data = await res.json();
      
      // Handle different response formats
      // Django REST Framework might return an object with 'results' or directly an array
      let items: any[] = [];
      
      if (Array.isArray(data)) {
        items = data;
      } else if (data.results && Array.isArray(data.results)) {
        items = data.results;
      } else if (data.items && Array.isArray(data.items)) {
        items = data.items;
      } else {
        console.warn('Unexpected API response format:', data);
        return [];
      }
      
      // Transform Django data to frontend format
      return items.map((item: any) => ({
        id: item.id,
        name: item.brand_name,
        price: item.selling_price,
        description: item.description,
        quantity: item.quantity_in_stock,
        image: item.image ? 
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${item.image}` : 
          undefined,
        category: item.category?.name,
        inStock: item.quantity_in_stock > 0 && item.is_active,
        is_active: item.is_active,
      }));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return []; // Return empty array on error
    }
  },

  // Get single product for customers (public endpoint)
  async getCustomerProduct(id: string): Promise<FrontendProduct> {
    const res = await fetch(`${API_BASE}/inventory/items/${id}/`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Product not found');
      }
      throw new Error(`Failed to fetch product (${res.status})`);
    }

    const item = await res.json();
    
    return {
      id: item.id,
      name: item.brand_name,
      price: item.selling_price,
      description: item.description,
      quantity: item.quantity_in_stock,
      image: item.image ? 
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${item.image}` : 
        undefined,
      category: item.category?.name,
      inStock: item.quantity_in_stock > 0 && item.is_active,
      is_active: item.is_active,
    };
  },

  // Get products for admin (authenticated)
  async list(): Promise<Product[]> {
    const headers = authApi.getAuthHeaders();
    
    const res = await fetch(`${API_BASE}/inventory/items/`, {
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Failed to fetch products' }));
      throw new Error(error.detail || `Failed to fetch products (${res.status})`);
    }

    return res.json();
  },

  // Get single product for admin
  async get(id: string): Promise<Product> {
    const headers = authApi.getAuthHeaders();
    
    const res = await fetch(`${API_BASE}/inventory/items/${id}/`, {
      headers,
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Product not found');
      }
      const error = await res.json().catch(() => ({ detail: 'Failed to fetch product' }));
      throw new Error(error.detail || `Failed to fetch product (${res.status})`);
    }

    return res.json();
  },
};

// Helper function to transform Django product to frontend format
export function transformToFrontendProduct(item: Product): FrontendProduct {
  return {
    id: item.id,
    name: item.brand_name,
    price: item.selling_price,
    description: item.description,
    quantity: item.quantity_in_stock,
    image: item.image ? 
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${item.image}` : 
      undefined,
    category: item.category?.name,
    inStock: item.quantity_in_stock > 0 && item.is_active,
    is_active: item.is_active,
  };
}