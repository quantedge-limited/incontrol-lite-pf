// types/inventory.ts

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price_per_unit: number;
  total_value: number;
  received_at: string;
  expiry_date?: string;
  supplier: number;
  supplier_name: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface Product extends Omit<InventoryItem, 'supplier' | 'created_by' | 'total_value'> {
  inStock: boolean;
  image: string;
  brand: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
}