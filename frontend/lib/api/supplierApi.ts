const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface Supplier {
  id: string;
  name: string;  // Add this
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

export const supplierApi = {
  // Create supplier
  async create(supplierData: any) {
    // Convert supplies field to additional_info if needed
    const data = {
      ...supplierData,
      additional_info: supplierData.supplies ? { supplies: supplierData.supplies } : null,
    };
    delete data.supplies;

    const res = await fetch(`${API_BASE}/staff/suppliers/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to create supplier');
    }
    return await res.json();
  },

  // List all suppliers
  async list() {
    const res = await fetch(`${API_BASE}/staff/suppliers/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch suppliers');
    return await res.json();
  },

  // Update supplier
  async update(id: string, supplierData: any) {
    const res = await fetch(`${API_BASE}/staff/suppliers/${id}/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(supplierData),
    });
    if (!res.ok) throw new Error('Failed to update supplier');
    return await res.json();
  },

  // Delete supplier
  async delete(id: string) {
    const res = await fetch(`${API_BASE}/staff/suppliers/${id}/delete/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to delete supplier');
  },

  // Get single supplier
  async get(id: string) {
    const res = await fetch(`${API_BASE}/staff/suppliers/${id}/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch supplier');
    return await res.json();
  },
};