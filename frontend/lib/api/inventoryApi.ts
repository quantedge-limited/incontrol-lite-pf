const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com/api';

import { authApi } from './authApi';

// Helper to check authentication before making requests
function checkAuth(): void {
  if (!authApi.isAuthenticated()) {
    throw new Error('Not authenticated. Please login first.');
  }
}

// Helper to get auth token
function getAuthToken(): string {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('Not authenticated');
  }
  return token;
}

export interface InventoryItem {
  id: string;
  brand_name: string;
  description?: string;
  quantity_in_stock: number;
  selling_price: number;
  cost_price: number;
  category: string;  // Category ID
  category_details?: {
    id: string;
    name: string;
    description?: string;
  };
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
  category: string;  // Category ID
  image?: string;
  is_active?: boolean;
}

export const inventoryApi = {
  // Create inventory item (requires authentication)
  async create(itemData: InventoryFormData, imageFile?: File): Promise<InventoryItem> {
    checkAuth();
    
    const formData = new FormData();
    
    // Add all fields
    Object.entries(itemData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Add image if exists
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const token = getAuthToken();
    
    const res = await fetch(`${API_BASE}/inventory/items/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // No Content-Type header for FormData
      },
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(
        error.detail || 
        Object.values(error).flat().join(', ') || 
        'Failed to create item'
      );
    }
    
    return res.json();
  },

  // List inventory items (public - no auth required)
  async list(): Promise<InventoryItem[]> {
    const res = await fetch(`${API_BASE}/inventory/items/`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch inventory items');
    }
    
    return res.json();
  },

  // Get single item (public - no auth required)
  async get(id: string): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/inventory/items/${id}/`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Inventory item not found');
      }
      throw new Error('Failed to fetch inventory item');
    }
    
    return res.json();
  },

  // Update item (requires authentication) - FIXED: Use FormData for updates too
  async update(id: string, itemData: Partial<InventoryFormData>, imageFile?: File | null): Promise<InventoryItem> {
    checkAuth();
    
    const formData = new FormData();
    
    // Add all fields that are provided
    Object.entries(itemData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Handle image
    if (imageFile !== undefined) {
      if (imageFile === null) {
        // Send empty string to clear image
        formData.append('image', '');
      } else if (imageFile instanceof File) {
        // Send new image file
        formData.append('image', imageFile);
      }
    }
    
    const token = getAuthToken();
    
    const res = await fetch(`${API_BASE}/inventory/items/${id}/update/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(
        error.detail || 
        Object.values(error).flat().join(', ') || 
        'Failed to update item'
      );
    }
    
    return res.json();
  },

  // Delete item (requires authentication)
  async delete(id: string): Promise<void> {
    checkAuth();
    
    const token = getAuthToken();
    
    const res = await fetch(`${API_BASE}/inventory/items/${id}/delete/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Item not found');
      }
      throw new Error('Failed to delete inventory item');
    }
  },

  // Get categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/inventory/categories/`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return res.json();
  },

  // Create category (requires auth)
  async createCategory(categoryData: { name: string; description?: string }) {
    checkAuth();
    
    const token = getAuthToken();
    
    const res = await fetch(`${API_BASE}/inventory/categories/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to create category');
    }
    
    return res.json();
  },
};