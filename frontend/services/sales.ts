import { apiClient } from '@/lib/apiClient';
import { AxiosResponse } from 'axios';

export interface OrderResponse {
  order_id: string;
  status?: string;
  [key: string]: any; // extra fields
}

export interface CartApiItem {
  id: string;
  inventory_id: number;
  inventory_name: string;
  price_per_unit: number;
  quantity: number;
  image_path?: string | null;
}

export interface CartResponse {
  items: CartApiItem[];
}

// Create a new order
export const createOrder = async (payload: any): Promise<OrderResponse> => {
  const response: AxiosResponse<OrderResponse> = await apiClient.post("/api/orders/", payload);
  return response.data;
};

// Get current cart
export const getCart = async (): Promise<CartResponse> => {
  const response: AxiosResponse<CartResponse> = await apiClient.get('/sales/cart/');
  return response.data;
};

// Add item to cart
export const addToCart = async (inventoryId: number, quantity: number): Promise<CartApiItem> => {
  const response: AxiosResponse<CartApiItem> = await apiClient.post('/sales/cart/add/', { inventory_id: inventoryId, quantity });
  return response.data;
};

// Update quantity of a cart item
export const updateCartItem = async (cartItemId: string, quantity: number): Promise<CartApiItem> => {
  const response: AxiosResponse<CartApiItem> = await apiClient.patch(`/sales/cart/items/${cartItemId}/update/`, { quantity });
  return response.data;
};

// Remove cart item
export const removeCartItem = async (cartItemId: string): Promise<void> => {
  await apiClient.delete(`/sales/cart/items/${cartItemId}/delete/`);
};

// Clear cart
export const clearCart = async (): Promise<void> => {
  await apiClient.delete('/sales/cart/clear/');
};
