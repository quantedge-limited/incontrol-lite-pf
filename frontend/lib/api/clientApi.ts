const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const clientApi = {
  // List all clients
  async list(): Promise<Client[]> {
    return apiRequest<Client[]>('/clients/');
  },

  // Get single client
  async get(id: string): Promise<Client> {
    return apiRequest<Client>(`/clients/${id}/`);
  },

  // Create client
  async create(clientData: Partial<Client>): Promise<Client> {
    return apiRequest<Client>('/clients/', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },

  // Update client
  async update(id: string, clientData: Partial<Client>): Promise<Client> {
    return apiRequest<Client>(`/clients/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  },

  // Delete client
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/clients/${id}/`, {
      method: 'DELETE',
    });
  },

  // Search clients by name or email
  async search(query: string): Promise<Client[]> {
    return apiRequest<Client[]>(`/clients/search/?q=${encodeURIComponent(query)}`);
  },
};