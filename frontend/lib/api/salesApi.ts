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
  client?: {
    id: string;
    name: string;
  };
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  sale_type: string;
  total_amount: number;
  notes?: string;
  items: Array<{
    id: string;
    inventory: {
      id: string;
      name: string;
    };
    quantity: number;
    price_per_unit: number;
    total_price: number;
  }>;
  created_by?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

// New: Cart API types
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

// New: Create sale DTO
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

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (requireAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Important for session cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const salesApi = {
  // Get sales statistics for dashboard
  async getStats(): Promise<SalesStats> {
    return apiRequest<SalesStats>('/sales/stats/');
  },

  // Get chart data
  async getChartData(): Promise<ChartData> {
    return apiRequest<ChartData>('/sales/chart-data/');
  },

  // List all sales
  async list(): Promise<Sale[]> {
    return apiRequest<Sale[]>('/sales/');
  },

  // Create a sale (for walk-in sales)
  async create(saleData: CreateSaleDto): Promise<Sale> {
    return apiRequest<Sale>('/sales/create/', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  },

  // Get single sale
  async get(id: string): Promise<Sale> {
    return apiRequest<Sale>(`/sales/${id}/`);
  },

  // Delete sale
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/sales/${id}/delete/`, {
      method: 'DELETE',
    });
  },

  // Cart API (no auth required for guest carts)
  async getCart(): Promise<Cart> {
    return apiRequest<Cart>('/sales/cart/', {
      method: 'GET',
    }, false);
  },

  async addToCart(inventoryId: number, quantity: number = 1): Promise<CartItem> {
    return apiRequest<CartItem>('/sales/cart/', {
      method: 'POST',
      body: JSON.stringify({ inventory_id: inventoryId, quantity }),
    }, false);
  },

  async updateCartItem(itemId: string, quantity: number): Promise<CartItem> {
    return apiRequest<CartItem>(`/sales/cart/items/${itemId}/`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }, false);
  },

  async removeCartItem(itemId: string): Promise<void> {
    return apiRequest<void>(`/sales/cart/items/${itemId}/`, {
      method: 'DELETE',
    }, false);
  },

  async clearCart(): Promise<void> {
    return apiRequest<void>('/sales/cart/', {
      method: 'DELETE',
    }, false);
  },

  async checkout(checkoutData: CheckoutDto): Promise<Sale> {
    return apiRequest<Sale>('/sales/checkout/', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    }, false);
  },
};