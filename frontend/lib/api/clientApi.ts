const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

import { authApi } from './authApi';

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;  // Note: In Django it's "phone_number", but you can map it
  address?: string;
  additional_info?: string; // Add this if you need it
  created_at: string;
  updated_at: string;
}

export const clientApi = {
  // List all clients - using the correct endpoint from Django
  async list(): Promise<Client[]> {
    const res = await fetch(`${API_BASE}/staff/clients/`, {
      method: 'GET', // Explicitly set GET method
      headers: authApi.getAuthHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Failed to fetch clients' }));
      throw new Error(error.detail || 'Failed to fetch clients');
    }
    return res.json();
  },

  // Get single client - from Django: ClientRetrieveView
  async get(id: string): Promise<Client> {
    const res = await fetch(`${API_BASE}/staff/clients/${id}/`, {
      method: 'GET',
      headers: authApi.getAuthHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Failed to fetch client' }));
      throw new Error(error.detail || 'Failed to fetch client');
    }
    return res.json();
  },

  // Create client - from Django: ClientCreateView
  async create(clientData: Partial<Client>): Promise<Client> {
    // Map phone to phone_number for Django
    const mappedData: any = { ...clientData };
    if (mappedData.phone !== undefined) {
      mappedData.phone_number = mappedData.phone;
      delete mappedData.phone;
    }

    const res = await fetch(`${API_BASE}/staff/clients/create/`, {
      method: 'POST',
      headers: authApi.getAuthHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(mappedData),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Failed to create client' }));
      throw new Error(error.detail || 'Failed to create client');
    }

    const result = await res.json();
    // Map phone_number back to phone for frontend consistency
    if (result.phone_number) {
      result.phone = result.phone_number;
    }
    return result;
  },

  // Update client - from Django: ClientUpdateView
  async update(id: string, clientData: Partial<Client>): Promise<Client> {
    // Map phone to phone_number for Django
    const mappedData: any = { ...clientData };
    if (mappedData.phone !== undefined) {
      mappedData.phone_number = mappedData.phone;
      delete mappedData.phone;
    }

    const res = await fetch(`${API_BASE}/staff/clients/${id}/update/`, {
      method: 'PUT',
      headers: authApi.getAuthHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(mappedData),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Failed to update client' }));
      throw new Error(error.detail || 'Failed to update client');
    }

    const result = await res.json();
    // Map phone_number back to phone for frontend consistency
    if (result.phone_number) {
      result.phone = result.phone_number;
    }
    return result;
  },

  // Delete client - from Django: ClientDeleteView
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/staff/clients/${id}/delete/`, {
      method: 'DELETE',
      headers: authApi.getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Failed to delete client' }));
      throw new Error(error.detail || 'Failed to delete client');
    }
  },

  // Note: You don't have a search endpoint in Django yet
  // You'll need to implement it in Django first
  async search(query: string): Promise<Client[]> {
    // Check if search endpoint exists first
    const res = await fetch(`${API_BASE}/staff/clients/search/?q=${encodeURIComponent(query)}`, {
      headers: authApi.getAuthHeaders(),
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        // If search endpoint doesn't exist, fall back to filtering on client side
        const allClients = await this.list();
        return allClients.filter(client => 
          client.first_name.toLowerCase().includes(query.toLowerCase()) ||
          client.last_name.toLowerCase().includes(query.toLowerCase()) ||
          (client.email && client.email.toLowerCase().includes(query.toLowerCase()))
        );
      }
      const error = await res.json().catch(() => ({ detail: 'Failed to search clients' }));
      throw new Error(error.detail || 'Failed to search clients');
    }
    
    return res.json();
  },
};