const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

import { authApi } from './authApi';

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface InventoryItem {
  id: number;

  brand_name: string;
  description?: string;

  quantity_in_stock: number;

  selling_price: number;
  cost_price: number;

  category: number;
  category_details?: Category;

  image?: string;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface InventoryFormData {
  brand_name: string;
  description?: string;
  quantity_in_stock: number;
  selling_price: number;
  cost_price: number;
  category: number;
  is_active?: boolean;
}


function requireAuth(): HeadersInit {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('Not authenticated');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

export const inventoryApi = {

  async list(): Promise<InventoryItem[]> {
    const res = await fetch(`${API_BASE}/staff/products/`);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  async get(id: number): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/staff/products/${id}/`);
    if (!res.ok) throw new Error('Item not found');
    return res.json();
  },

  async create(data: InventoryFormData): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/staff/products/`, {
      method: 'POST',
      headers: {
        ...requireAuth(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create item');
    }

    return res.json();
  },

  async update(id: number, data: Partial<InventoryFormData>): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/staff/products/${id}/`, {
      method: 'PUT',
      headers: {
        ...requireAuth(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to update item');
    }

    return res.json();
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/staff/products/${id}/`, {
      method: 'DELETE',
      headers: requireAuth(),
    });

    if (!res.ok) {
      throw new Error('Failed to delete item');
    }
  },


  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/staff/categories/`);
    if (!res.ok) {
      throw new Error('Failed to fetch categories');
    }
    return res.json();
  },

  async createCategory(data: { name: string; description?: string }): Promise<Category> {
    const res = await fetch(`${API_BASE}/staff/categories/`, {
      method: 'POST',
      headers: {
        ...requireAuth(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create category');
    }

    return res.json();
  },
};
