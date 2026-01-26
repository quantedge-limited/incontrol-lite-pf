const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

import { authApi } from './authApi';

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  additional_info?: any;
  created_at: string;
  updated_at: string;
  created_by?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

// Define the type used for creating/updating suppliers
export interface SupplierFormData {
  name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  supplies?: any; // optional field mapped to additional_info
  additional_info?: any;
}

export const supplierApi = {
  // Create supplier
  async create(supplierData: SupplierFormData): Promise<Supplier> {
    const payload = {
      ...supplierData,
      additional_info: supplierData.supplies
        ? { supplies: supplierData.supplies }
        : supplierData.additional_info || null,
    };

    delete (payload as any).supplies;

    const res = await fetch(`${API_BASE}/staff/suppliers/create/`, {
      method: 'POST',
      headers: authApi.getAuthHeaders(), // No arguments needed
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Failed to create supplier' }));
      throw new Error(error.detail);
    }

    return res.json();
  },

  // List all suppliers
  async list(): Promise<Supplier[]> {
    const res = await fetch(`${API_BASE}/staff/suppliers/`, {
      headers: authApi.getAuthHeaders(), // No arguments needed
    });

    if (!res.ok) {
      throw new Error('Failed to fetch suppliers');
    }

    return res.json();
  },

  // Get single supplier
  async get(id: string): Promise<Supplier> {
    const res = await fetch(`${API_BASE}/staff/suppliers/${id}/`, {
      headers: authApi.getAuthHeaders(), // No arguments needed
    });

    if (!res.ok) {
      throw new Error('Failed to fetch supplier');
    }

    return res.json();
  },

  // Update supplier
  async update(
    id: string,
    supplierData: Partial<SupplierFormData>
  ): Promise<Supplier> {
    const res = await fetch(`${API_BASE}/staff/suppliers/${id}/update/`, {
      method: 'PUT',
      headers: authApi.getAuthHeaders(), // No arguments needed
      body: JSON.stringify(supplierData),
    });

    if (!res.ok) {
      throw new Error('Failed to update supplier');
    }

    return res.json();
  },

  // Delete supplier
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/staff/suppliers/${id}/delete/`, {
      method: 'DELETE',
      headers: authApi.getAuthHeaders(), // No arguments needed
    });

    if (!res.ok) {
      throw new Error('Failed to delete supplier');
    }
  },
};