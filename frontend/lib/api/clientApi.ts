const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const clientApi = {
  // Create client
  async create(clientData: any) {
    const res = await fetch(`${API_BASE}/staff/clients/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(clientData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to create client');
    }
    return await res.json();
  },

  // List all clients
  async list() {
    const res = await fetch(`${API_BASE}/staff/clients/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch clients');
    return await res.json();
  },

  // Update client
  async update(id: string, clientData: any) {
    const res = await fetch(`${API_BASE}/staff/clients/${id}/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(clientData),
    });
    if (!res.ok) throw new Error('Failed to update client');
    return await res.json();
  },

  // Delete client
  async delete(id: string) {
    const res = await fetch(`${API_BASE}/staff/clients/${id}/delete/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to delete client');
  },
};