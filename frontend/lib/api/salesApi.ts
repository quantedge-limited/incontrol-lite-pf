// lib/api/salesApi.ts - UPDATED to match Django backend
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com/api';

// Update interfaces to match Django models
export interface OrderItem {
  id?: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  inventory_item?: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  reference: string;
  status: 'pending' | 'paid' | 'cancelled';
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  subtotal: number;
  items: OrderItem[];
  created_at: string;
}

export interface CreateOrderDto {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items: Array<{
    inventory_id: string;  // Changed from "inventory" to "inventory_id" to match Django
    quantity: number;
  }>;
}

// For frontend cart (if you're maintaining a local cart)
export interface CartItem {
  inventory_id: string;
  inventory_name: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
}

// Stats interface (if you have stats endpoint)
export interface SalesStats {
  total_revenue: number;
  total_orders: number;
  recent_orders: number;
  avg_order_value: number;
  top_products: Array<{
    name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
}

// -------------------
// HELPER FUNCTION
// -------------------
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get auth token if available
  const token = localStorage.getItem('access_token');
  
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let error: any;
    try {
      error = await response.json();
    } catch {
      error = { detail: `HTTP ${response.status}: ${response.statusText}` };
    }
    throw new Error(error.detail || error.message || 'Request failed');
  }

  // Handle empty responses (like for DELETE)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// -------------------
// SALES/ORDERS API
// -------------------
export const salesApi = {
  // Create a new order (checkout)
  createOrder: (orderData: CreateOrderDto): Promise<Order> =>
    apiRequest<Order>('/sales/checkout/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  // Get all orders
  getOrders: (): Promise<Order[]> =>
    apiRequest<Order[]>('/sales/orders/'),

  // Get single order
  getOrder: (id: string): Promise<Order> =>
    apiRequest<Order>(`/sales/orders/${id}/`),

  // Delete order (if needed)
  deleteOrder: (id: string): Promise<void> =>
    apiRequest<void>(`/sales/orders/${id}/`, {
      method: 'DELETE',
    }),

  // Get sales statistics (if you have this endpoint)
  getStats: (): Promise<SalesStats> =>
    apiRequest<SalesStats>('/sales/stats/'),

  // -------------------
  // CART MANAGEMENT (Frontend-only, since Django doesn't have cart endpoints)
  // -------------------
  
  // Get cart from localStorage
  getCartFromStorage: (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    const cartJson = localStorage.getItem('cart');
    return cartJson ? JSON.parse(cartJson) : [];
  },

  // Save cart to localStorage
  saveCartToStorage: (cart: CartItem[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cart', JSON.stringify(cart));
  },

  // Add item to cart (local storage)
  addToCart: (item: CartItem): CartItem[] => {
    const cart = salesApi.getCartFromStorage();
    const existingItemIndex = cart.findIndex(
      (ci) => ci.inventory_id === item.inventory_id
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      cart[existingItemIndex].quantity += item.quantity;
      cart[existingItemIndex].total_price = 
        cart[existingItemIndex].quantity * cart[existingItemIndex].price_per_unit;
    } else {
      // Add new item
      cart.push(item);
    }

    salesApi.saveCartToStorage(cart);
    return cart;
  },

  // Update cart item quantity
  updateCartItem: (inventoryId: string, quantity: number): CartItem[] => {
    const cart = salesApi.getCartFromStorage();
    const itemIndex = cart.findIndex((ci) => ci.inventory_id === inventoryId);

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart[itemIndex].quantity = quantity;
        cart[itemIndex].total_price = quantity * cart[itemIndex].price_per_unit;
      }
    }

    salesApi.saveCartToStorage(cart);
    return cart;
  },

  // Remove item from cart
  removeCartItem: (inventoryId: string): CartItem[] => {
    const cart = salesApi.getCartFromStorage();
    const filteredCart = cart.filter((ci) => ci.inventory_id !== inventoryId);
    salesApi.saveCartToStorage(filteredCart);
    return filteredCart;
  },

  // Clear entire cart
  clearCart: (): void => {
    salesApi.saveCartToStorage([]);
  },

  // Calculate cart total
  calculateCartTotal: (cart: CartItem[]): number => {
    return cart.reduce((total, item) => total + item.total_price, 0);
  },
};

// Helper to transform frontend cart to order data
export function transformCartToOrderData(
  cart: CartItem[],
  customerData: {
    name: string;
    phone: string;
    email?: string;
  }
): CreateOrderDto {
  return {
    customer_name: customerData.name,
    customer_phone: customerData.phone,
    customer_email: customerData.email,
    items: cart.map(item => ({
      inventory_id: item.inventory_id,
      quantity: item.quantity,
    })),
  };
}