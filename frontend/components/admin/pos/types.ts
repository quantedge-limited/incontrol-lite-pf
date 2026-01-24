// components/admin/pos/types.ts
export interface CartItem {
  id: string;
  inventory_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  stock: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  price_per_unit: number;
  quantity: number;
  image_path?: string;
  sku?: string;
  category?: string;
  brand?: string;
}

export interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  paymentMethod: string;
  address?: string;
}