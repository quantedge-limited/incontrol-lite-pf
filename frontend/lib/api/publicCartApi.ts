// lib/api/publicCartApi.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface PublicCartItem {
  id: string;  // This should match what Django returns
  inventory_id: number;
  inventory_name: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
}

export interface PublicCart {
  id: string;
  session_id: string;
  items: PublicCartItem[];
  total_price: number;
  created_at: string;
  updated_at: string;
}

async function publicApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = { 
    'Content-Type': 'application/json', 
    ...options.headers 
  };

  // Add cache control headers to prevent caching
  headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  headers['Pragma'] = 'no-cache';
  headers['Expires'] = '0';

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',  // Important for sessions
    });

    if (!response.ok) {
      const text = await response.text();
      let error: any;
      try {
        error = JSON.parse(text);
      } catch {
        error = { detail: text || 'Network error' };
      }
      throw new Error(error.detail || error.error || `HTTP ${response.status}: ${text}`);
    }

    return response.json();
  } catch (error: any) {
    console.error('API Request failed:', error);
    throw new Error(error.message || 'Network request failed');
  }
}

export const publicCartApi = {
  getCart: () => publicApiRequest<PublicCart>('/sales/cart/'),
  
  addToCart: (inventoryId: number, quantity: number = 1) =>
    publicApiRequest<PublicCart>('/sales/cart/', {  // Note: Returns full cart
      method: 'POST', 
      body: JSON.stringify({ inventory_id: inventoryId, quantity }) 
    }),

  updateCartItem: (itemId: string, quantity: number) =>
    publicApiRequest<PublicCart>('/sales/cart/items/' + itemId + '/', {  // Note: Returns full cart
      method: 'PUT', 
      body: JSON.stringify({ quantity }) 
    }),

  removeCartItem: (itemId: string) =>
    publicApiRequest<PublicCart>('/sales/cart/items/' + itemId + '/', { 
      method: 'DELETE' 
    }),

  clearCart: () =>
    publicApiRequest<{message: string}>('/sales/cart/', { method: 'DELETE' }),
};