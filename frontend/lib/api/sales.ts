// lib/api/sales.ts - Complete file with fixes
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com/api';

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

  // Create headers as a plain object
  const headersObj: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add any headers from options
  if (options.headers) {
    if (Array.isArray(options.headers)) {
      // Handle array of [key, value] pairs
      options.headers.forEach(([key, value]) => {
        headersObj[key] = value;
      });
    } else if (options.headers instanceof Headers) {
      // Handle Headers object
      options.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
    } else {
      // Handle plain object
      Object.assign(headersObj, options.headers);
    }
  }

  // Add auth token if required
  if (requireAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headersObj['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      ...options,
      headers: headersObj,
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
  // Sales - Using correct endpoint /api/pos/pos-transactions/
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
    const url = `/pos/pos-transactions/${queryString ? `?${queryString}` : ''}`;

    return apiRequest<{
      results: Sale[];
      count: number;
      next: string | null;
      previous: string | null;
    }>(url, {}, true); // requireAuth: true for admin endpoints
  },

  getSale: (saleId: string) =>
    apiRequest<Sale>(`/pos/pos-transactions/${saleId}/`, {}, true),

  createSale: (data: {
    client?: number;
    payment_method: 'cash' | 'card' | 'mobile_money';
    served_by: string;
    items: {
      product: number;
      quantity: number;
      unit_price: number;
    }[];
  }) => apiRequest<Sale>('/pos/pos-transactions/', {
    method: 'POST',
    body: JSON.stringify(data),
  }, false), // No auth required for public checkout

  deleteSale: (saleId: string) =>
    apiRequest<{ message: string }>(`/pos/pos-transactions/${saleId}/`, {
      method: 'DELETE',
    }, true),
};

// ===== CART API (Client-Side Only) =====
// Cart is now managed in CartContext using localStorage
// No backend cart endpoints exist

// ===== CHECKOUT API =====
// Checkout now creates POS transactions directly
// Use posApi.createSale() for checkout

// ===== HEALTH CHECK =====
export const healthApi = {
  check: () => apiRequest<{
    status: string;
    service: string;
    timestamp: string;
  }>('/sales/health/'),
};