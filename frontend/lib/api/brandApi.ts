const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Add this to each API service
import { authApi } from './authApi';




export interface Brand {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const brandApi = {
  // List all brands
  async list(): Promise<Brand[]> {
    const res = await fetch(`${API_BASE}/inventory/brands/`, {
      headers: authApi.getAuthHeaders(), // Use the helper
    });
    if (!res.ok) throw new Error('Failed to fetch brand');
    return await res.json();
  },

  // Create brand
  async create(name: string, description?: string): Promise<Brand> {
    const res = await fetch(`${API_BASE}/inventory/brand/create/`, {
      method: 'POST',
      headers: authApi.getAuthHeaders(),
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to create brand');
    }
    return await res.json();
  },

  // Update brand
  async update(id: string, data: Partial<Brand>): Promise<Brand> {
    const res = await fetch(`${API_BASE}/inventory/brand/${id}/update/`, {
      method: 'PUT',
      headers: authApi.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update brand');
    return await res.json();
  },

  // Delete brand
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/inventory/brand/${id}/delete/`, {
      method: 'DELETE',
      headers: authApi.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete brand');
  },
};