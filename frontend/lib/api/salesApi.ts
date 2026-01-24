const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

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

export interface Sale {
  id: string;
  client?: { id: string; name: string };
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  sale_type: string;
  total_amount: number;
  notes?: string;
  items: Array<{
    id: string;
    inventory: { id: string; name: string };
    quantity: number;
    price_per_unit: number;
    total_price: number;
  }>;
  created_by?: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

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

export interface CreateSaleDto {
  client?: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  buyer_address?: string;
  sale_type: 'online' | 'walkin';
  total_amount: number;
  notes?: string;
  items: Array<{
    inventory: string;
    quantity: number;
    price_per_unit: number;
  }>;
}

// -------------------
// HELPER FUNCTION
// -------------------
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...options.headers };

  if (requireAuth) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Authentication token missing');
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // for session cookies
  });

  if (!response.ok) {
    let error: any;
    try {
      error = await response.json();
    } catch {
      error = { detail: 'Network error' };
    }
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// -------------------
// SALES API
// -------------------
export const salesApi = {
  // Dashboard stats
  getStats: () => apiRequest<SalesStats>('/sales/stats/'),

  getChartData: () => apiRequest<ChartData>('/sales/chart-data/'),

  list: () => apiRequest<Sale[]>('/sales/'),

  create: (saleData: CreateSaleDto) =>
    apiRequest<Sale>('/sales/create/', { method: 'POST', body: JSON.stringify(saleData) }),

  get: (id: string) => apiRequest<Sale>(`/sales/${id}/`),

  delete: (id: string) =>
    apiRequest<void>(`/sales/${id}/delete/`, { method: 'DELETE' }),

  // -------------------
  // CART API (guest-friendly)
  // -------------------
  getCart: () => apiRequest<Cart>('/sales/cart/', {}, false),

  addToCart: (inventoryId: number, quantity: number = 1) =>
    apiRequest<CartItem>(
      '/sales/cart/',
      { method: 'POST', body: JSON.stringify({ inventory_id: inventoryId, quantity }) },
      false
    ),

  updateCartItem: (itemId: string, quantity: number) =>
    apiRequest<CartItem>(
      `/sales/cart/items/${itemId}/`,
      { method: 'PUT', body: JSON.stringify({ quantity }) },
      false
    ),

  removeCartItem: (itemId: string) =>
    apiRequest<void>(`/sales/cart/items/${itemId}/`, { method: 'DELETE' }, false),

  clearCart: () =>
    apiRequest<void>('/sales/cart/', { method: 'DELETE' }, false),

  checkout: (checkoutData: CheckoutDto) =>
    apiRequest<Sale>('/sales/checkout/', { method: 'POST', body: JSON.stringify(checkoutData) }, false),
};
