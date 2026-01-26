export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price_per_unit: number;
  total_value: number;
  received_at: string;
  expiry_date?: string;
  
  // Relationships
  supplier?: {
    id: string;
    name: string;
  };
  supplier_id?: string;
  supplier_name?: string;
  
  brand?: {
    id: string;
    name: string;
  };
  brand_id?: string;
  brand_name?: string;
  
  created_by?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  created_by_name?: string;
  
  created_at: string;
  updated_at: string;
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
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  itemsExpiringSoon: number;
  lowStockItems: number;
  recentAdditions: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string; // Add this
  brand?: string;
  supplier?: string;
  price: number;
  quantity: number;
  dateAdded: string;
}


export const STORAGE_KEY = 'incontrol_inventory_products_v1';
