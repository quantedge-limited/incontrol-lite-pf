// components/admin/pos/types.ts
// Minimal types for POS only

export interface POSCartItem {
  id: string; // Unique cart item ID
  product_id: number; // Backend product ID
  name: string; // Display name
  price: number; // Unit price
  quantity: number; // Quantity in cart
  image?: string; // Product image URL
  stock_qty: number; // Current stock quantity
}

export interface CustomerData {
  name: string;
  phone?: string;
  email?: string;
  paymentMethod?: string;
  address?: string;
}

// Re-export Product type from inventoryApi for convenience
export type { Product } from '@/lib/api/inventoryApi';