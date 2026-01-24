// lib/api/sales.ts - Complete file with fixes
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// ===== TYPES =====
export interface CartItem {
  id: string;
  inventory_id: number;
  inventory_name: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
}

export interface Cart {
  id: string;
  session_id: string;
  items: CartItem[];
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  inventory: number;
  quantity: number;
  price_per_unit: number;
  total_price: number;
}

export interface Sale {
  id: string;
  sale_type: 'online' | 'walkin';
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  client?: number;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_email?: string;
  buyer_address?: string;
  created_at: string;
  updated_at: string;
  items: SaleItem[];
}


async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Only add auth token if required
  if (requireAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text();
      console.error(`API Error [${response.status}] for ${url}:`, text);
      
      let error: any;
      try {
        error = JSON.parse(text);
      } catch {
        error = { detail: text || `HTTP ${response.status}` };
      }
      
      // More detailed error message
      const errorMessage = error.detail || error.error || error.message || 
                          (error.errors ? JSON.stringify(error.errors) : `HTTP ${response.status}`);
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// ===== POS API (Admin) =====
export const posApi = {
  // Sales
  getSales: (params?: { 
    start_date?: string; 
    end_date?: string; 
    sale_type?: 'online' | 'walkin';
    page?: number;
    page_size?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.sale_type) queryParams.append('sale_type', params.sale_type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    
    const queryString = queryParams.toString();
    const url = `/sales/pos/sales/${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{
      sales: Sale[];
      total: number;
      page: number;
      page_size: number;
      pages: number;
    }>(url);
  },

  getSale: (saleId: string) =>
    apiRequest<Sale>(`/sales/pos/sales/${saleId}/`),

  createSale: (data: {
    client?: number;
    sale_type?: 'walkin' | 'online';
    total_amount?: number;
    notes?: string;
    buyer_name?: string;
    buyer_phone?: string;
    buyer_email?: string;
    buyer_address?: string;
    payment_method?: 'cash' | 'mpesa';
    items: {
      inventory: number;  // Fixed: was inventory_id
      quantity: number;
      price_per_unit?: number;
    }[];
  }) => apiRequest<Sale>('/sales/pos/sales/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  cancelSale: (saleId: string) =>
    apiRequest<{ message: string }>(`/sales/pos/sales/${saleId}/`, {
      method: 'DELETE',
    }),
};

// ===== CART API (Public) =====
export const cartApi = {
  getCart: () =>
    apiRequest<Cart>('/sales/cart/'),

  addToCart: (inventoryId: number, quantity: number = 1) =>
    apiRequest<Cart>('/sales/cart/', {
      method: 'POST',
      body: JSON.stringify({ 
        inventory_id: inventoryId,  // Fixed: was inventory_id
        quantity 
      }),
    }),

  updateCartItem: (itemId: string, quantity: number) =>
    apiRequest<Cart>(`/sales/cart/items/${itemId}/`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }, false),

  removeCartItem: (itemId: string) =>
    apiRequest<Cart>(`/sales/cart/items/${itemId}/`, {
      method: 'DELETE',
    }),

  clearCart: () =>
    apiRequest<{ message: string }>('/sales/cart/', {
      method: 'DELETE',
    }),
};

// ===== CHECKOUT API =====
export const checkoutApi = {
  checkout: (data: {
    buyer_name: string;
    buyer_email: string;
    buyer_phone: string;
    buyer_address: string;
    notes?: string;
    payment_method: 'mpesa';
  }) => apiRequest<{
    success: boolean;
    order_id: string;
    order_number: string;
    total_amount: number;
    payment_id: string;
    payment_reference?: string;
    message: string;
    payment_response?: any;
  }>('/sales/checkout/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getOrderStatus: (orderId: string) =>
    apiRequest<{
      order_id: string;
      order_number: string;
      status: string;
      total_amount: number;
      created_at: string;
      items_count: number;
      buyer_name: string;
      buyer_phone: string;
      payment_id?: string;
      payment_status?: string;
      payment_method?: string;
      payment_reference?: string;
    }>(`/sales/orders/${orderId}/status/`),
};

// ===== HEALTH CHECK =====
export const healthApi = {
  check: () => apiRequest<{
    status: string;
    service: string;
    timestamp: string;
  }>('/sales/health/'),
};