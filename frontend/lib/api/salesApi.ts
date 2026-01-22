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

export const salesApi = {
  // Get sales statistics for dashboard
  async getStats(): Promise<SalesStats> {
    const res = await fetch(`${API_BASE}/sales/stats/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch sales stats');
    return await res.json();
  },

  // Get chart data
  async getChartData(): Promise<ChartData> {
    const res = await fetch(`${API_BASE}/sales/chart-data/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch chart data');
    return await res.json();
  },

  // List all sales
  async list(): Promise<Sale[]> {
    const res = await fetch(`${API_BASE}/sales/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch sales');
    return await res.json();
  },

  // Create a sale
  async create(saleData: any): Promise<Sale> {
    const res = await fetch(`${API_BASE}/sales/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(saleData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to create sale');
    }
    return await res.json();
  },

  // Get single sale
  async get(id: string): Promise<Sale> {
    const res = await fetch(`${API_BASE}/sales/${id}/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch sale');
    return await res.json();
  },

  // Delete sale
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/sales/${id}/delete/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to delete sale');
  },
};