export interface InventoryItem {
  id: string;
  brand_name: string;
  description?: string;
  category: string;  // This might be a string ID or object - check your backend
  category_details?: {
    id: string;
    name: string;
    description?: string;
  };
  selling_price: number;
  quantity_in_stock: number;  // Updated from 'quantity'
  image?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // These fields might not exist in your API
  // Remove them or mark as optional
  cost_price?: number;
  supplier_name?: string;  // Remove this if it doesn't exist
  total_value?: number;    // Remove or calculate client-side
  received_at?: string;    // Remove if doesn't exist
  expiry_date?: string;    // Remove if doesn't exist
}

export interface InventoryFormData {
  brand_name: string;
  description?: string;
  quantity_in_stock: number;
  selling_price: number;
  cost_price: number;
  category: string;  // Category ID
  image?: string;
  is_active?: boolean;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  itemsExpiringSoon: number;
  lowStockItems: number;
  recentAdditions: number;
}

// For public/customer view
export interface Product {
  id: string;
  brand_name: string;
  description?: string;
  selling_price: number;
  quantity_in_stock: number;
  image?: string;
  is_active: boolean;
  created_at: string;
}

export const STORAGE_KEY = 'incontrol_inventory_products_v1';