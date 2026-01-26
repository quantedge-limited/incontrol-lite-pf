const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  return {
    'Authorization': `Bearer ${token}`,
    ...extra,
  };
}


export interface InventoryFormData {
  name: string;
  description?: string;
  quantity: number;
  price_per_unit: number;
  received_at: string;
  expiry_date?: string;
  supplier_id?: string;
  brand_id?: string;
  sku?: string;
  category?: string;
  image_url?: string;
  image_path?: string;
}

// Also export InventoryItem if not already
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price_per_unit: number;
  total_value: number;
  received_at: string;
  expiry_date?: string;
  supplier_id?: string;
  supplier_name?: string;
  brand_id?: string;
  brand_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image_url?: string;
  image_path?: string;
  image?: string;
  sku?: string;
  category?: string;
}



export const inventoryApi = {
  async create(itemData: InventoryFormData): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/inventory/create/`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(itemData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to create inventory item');
    }
    return res.json();
  },

  async list(): Promise<InventoryItem[]> {
    const res = await fetch(`${API_BASE}/inventory/`, {
      headers: authHeaders(),
      credentials: 'include', // needed if using session cookies
    });

    if (!res.ok) throw new Error('Failed to fetch inventory items');
    return res.json();
  },

  async get(id: string): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/inventory/${id}/`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch inventory item');
    return res.json();
  },

  async update(id: string, itemData: Partial<InventoryFormData>): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/inventory/${id}/update/`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(itemData),
    });
    if (!res.ok) throw new Error('Failed to update inventory item');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/inventory/${id}/delete/`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete inventory item');
  },

  // Public endpoints (no auth)
  async getCustomerProducts(): Promise<InventoryItem[]> {
    const res = await fetch(`${API_BASE}/inventory/customer/products/`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getCustomerProduct(id: string): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/inventory/customer/products/${id}/`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },
};
