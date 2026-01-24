import { Sale } from '@/components/admin/sales/types';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Helper: get auth headers
function getAuthHeaders(additionalHeaders: Record<string, string> = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...additionalHeaders,
  };
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: options.headers || getAuthHeaders(),
      credentials: 'include',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: data?.detail || `HTTP ${response.status}`,
        status: response.status,
      };
    }

    return {
      data: data as T,
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 500,
    };
  }
}

// Sale Types
export interface SaleItem {
  id?: string;
  inventory: string;
  inventory_name?: string;
  quantity: number;
  price_per_unit: number;
  total_price?: number;
}

export interface BackendSale {
  id: string;
  client?: string | null;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  buyer_address?: string;
  sale_type: 'online' | 'walkin';
  total_amount: number;
  notes?: string;
  items: SaleItem[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSaleDto {
  client?: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  buyer_address?: string;
  sale_type: 'online' | 'walkin';
  total_amount: number;
  notes?: string;
  items: Omit<SaleItem, 'id' | 'inventory_name' | 'total_price'>[];
}

// Cart Types
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

export interface CheckoutDto {
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_address: string;
  sale_type: 'online';
  notes?: string;
}

// Sales Statistics Types
export interface SalesStats {
  total_revenue: number;
  recent_revenue: number;
  total_sales: number;
  recent_sales: number;
  avg_order_value: number;
  monthly_trend: number[];
  total_profit: number;
  recent_profit: number;
  top_products: Array<{
    inventory__name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
  low_stock_items: number;
  out_of_stock_items: number;
  recent_sales: Array<{
    id: string;
    date: string;
    type: string;
    amount: number;
    client: string;
    items_count: number;
  }>;
}

export interface ChartData {
  months: string[];
  totals: number[];
  counts: number[];
}

// Sales API
export const salesApi = {
  createSale: async (saleData: CreateSaleDto): Promise<ApiResponse<BackendSale>> =>
    apiRequest<BackendSale>('/sales/create/', {
      method: 'POST',
      body: JSON.stringify(saleData),
      headers: getAuthHeaders(),
    }),

  getSales: async (): Promise<ApiResponse<BackendSale[]>> =>
    apiRequest<BackendSale[]>('/sales/', {
      method: 'GET',
      headers: getAuthHeaders(),
    }),

  getSale: async (id: string): Promise<ApiResponse<BackendSale>> =>
    apiRequest<BackendSale>(`/sales/${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    }),

  deleteSale: async (id: string): Promise<ApiResponse<void>> =>
    apiRequest<void>(`/sales/${id}/delete/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }),

  getSalesStats: async (): Promise<ApiResponse<SalesStats>> =>
    apiRequest<SalesStats>('/sales/stats/', {
      method: 'GET',
      headers: getAuthHeaders(),
    }),

  getChartData: async (): Promise<ApiResponse<ChartData>> =>
    apiRequest<ChartData>('/sales/chart-data/', {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
};

// Cart API
export const cartApi = {
  getCart: async (): Promise<ApiResponse<Cart>> =>
    apiRequest<Cart>('/sales/cart/', {
      method: 'GET',
      headers: getAuthHeaders(),
    }),

  addToCart: async (inventoryId: number, quantity: number = 1): Promise<ApiResponse<CartItem>> =>
    apiRequest<CartItem>('/sales/cart/', {
      method: 'POST',
      body: JSON.stringify({ inventory_id: inventoryId, quantity }),
      headers: getAuthHeaders(),
    }),

  updateCartItem: async (itemId: string, quantity: number): Promise<ApiResponse<CartItem>> =>
    apiRequest<CartItem>(`/sales/cart/items/${itemId}/`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
      headers: getAuthHeaders(),
    }),

  removeCartItem: async (itemId: string): Promise<ApiResponse<void>> =>
    apiRequest<void>(`/sales/cart/items/${itemId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }),

  clearCart: async (): Promise<ApiResponse<void>> =>
    apiRequest<void>('/sales/cart/', {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }),

  checkout: async (checkoutData: CheckoutDto): Promise<ApiResponse<BackendSale>> =>
    apiRequest<BackendSale>('/sales/checkout/', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
      headers: getAuthHeaders(),
    }),
};
