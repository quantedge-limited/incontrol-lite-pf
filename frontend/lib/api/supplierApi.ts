// lib/api/supplierApi.ts - CORRECTED
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com/api';

import { authApi } from './authApi';

export interface Supplier {
  id: number;
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
  additional_info?: any;
}

export const supplierApi = {
  // Create supplier
  async create(supplierData: SupplierFormData): Promise<Supplier> {
    const headers = authApi.getAuthHeaders();
    const res = await fetch(`${API_BASE}/staff/suppliers/create/`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(supplierData),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ 
        detail: 'Failed to create supplier' 
      }));
      throw new Error(error.detail || 'Failed to create supplier');
    }

    return res.json();
  },

  // List all suppliers
  async list(): Promise<Supplier[]> {
    const headers = authApi.getAuthHeaders();
    const res = await fetch(`${API_BASE}/staff/suppliers/`, {
      headers: headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ 
        detail: 'Failed to fetch suppliers' 
      }));
      throw new Error(error.detail || 'Failed to fetch suppliers');
    }

    return res.json();
  },

  // Get single supplier
  async get(id: number): Promise<Supplier> {
    const headers = authApi.getAuthHeaders();
    const res = await fetch(`${API_BASE}/staff/suppliers/${id}/`, {
      headers: headers,
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Supplier not found');
      }
      const error = await res.json().catch(() => ({ 
        detail: 'Failed to fetch supplier' 
      }));
      throw new Error(error.detail || 'Failed to fetch supplier');
    }

    return res.json();
  },

  // Update supplier
  async update(
    id: number,
    supplierData: Partial<SupplierFormData>
  ): Promise<Supplier> {
    const headers = authApi.getAuthHeaders();
    const res = await fetch(`${API_BASE}/staff/suppliers/${id}/update/`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(supplierData),
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Supplier not found');
      }
      const error = await res.json().catch(() => ({ 
        detail: 'Failed to update supplier' 
      }));
      throw new Error(error.detail || 'Failed to update supplier');
    }

    return res.json();
  },

  // Delete supplier
  async delete(id: number): Promise<void> {
    const headers = authApi.getAuthHeaders();
    const res = await fetch(`${API_BASE}/staff/suppliers/${id}/delete/`, {
      method: 'DELETE',
      headers: headers,
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Supplier not found');
      }
      const error = await res.json().catch(() => ({ 
        detail: 'Failed to delete supplier' 
      }));
      throw new Error(error.detail || 'Failed to delete supplier');
    }
  },

  // Optional: Search suppliers
  async search(query: string): Promise<Supplier[]> {
    const headers = authApi.getAuthHeaders();
    
    // If you have a search endpoint
    try {
      const res = await fetch(
        `${API_BASE}/staff/suppliers/search/?q=${encodeURIComponent(query)}`,
        { headers }
      );
      
      if (res.ok) {
        return res.json();
      }
    } catch {
      // Fall through to client-side filtering
    }
    
    // Fallback to client-side filtering
    const allSuppliers = await this.list();
    const lowerQuery = query.toLowerCase();
    return allSuppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(lowerQuery) ||
      (supplier.email && supplier.email.toLowerCase().includes(lowerQuery)) ||
      (supplier.phone_number && supplier.phone_number.toLowerCase().includes(lowerQuery))
    );
  },
};