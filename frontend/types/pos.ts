// types/pos.ts
export interface POSCartItem {
  id: string; // Keep as string
  inventory_id: string; // Keep as string
  name: string;
  price: number;
  quantity: number;
  stock?: number;
  image?: string;
  image_url?: string;
}

export interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  paymentMethod: string;
  address?: string;
}