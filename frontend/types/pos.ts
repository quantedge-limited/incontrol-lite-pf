// types/pos.ts - UPDATED to match backend
import { Product } from '@/lib/api/inventoryApi';

export interface POSCartItem {
  id: string; // Unique cart item ID (frontend)
  product_id: number; // Backend product ID (matches Product.id)
  name: string; // Product display name
  price: number; // Unit price (selling_price)
  quantity: number; // Quantity in cart
  stock_qty: number; // Current stock quantity (from Product.stock_qty)
  image?: string; // Product image URL
  // Optional aliases for compatibility
  inventory_id?: number; // Alias for product_id (if needed)
  stock?: number; // Alias for stock_qty
  image_url?: string; // Alias for image
  category_name?: string; // For display purposes
}

// Customer data for checkout modal
export interface CustomerData {
  name: string;
  phone?: string;
  email?: string;
  paymentMethod?: string;
  address?: string;
}

// You can also export Product type for convenience
export type { Product };
