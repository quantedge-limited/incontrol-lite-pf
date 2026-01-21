// services/orderApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

interface CartItem {
  inventory_id: number;
  quantity: number;
}

interface CheckoutData {
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_address: string;
  notes?: string;
}

class OrderApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  // Cart operations
  async getCart() {
    return this.request('/sales/cart/');
  }

  async updateCart(items: CartItem[]) {
    throw new Error('Use addToCart for individual items instead');
  }

  async clearCart() {
    return this.request('/sales/cart/', {
      method: 'DELETE',
    });
  }

  async addToCart(inventoryId: number, quantity: number = 1) {
    return this.request('/sales/cart/', {
      method: 'POST',
      body: JSON.stringify({ inventory_id: inventoryId, quantity }),
    });
  }

  async updateCartItem(itemId: number, quantity: number) {
    return this.request(`/sales/cart/items/${itemId}/`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(itemId: number) {
    return this.request(`/sales/cart/items/${itemId}/`, {
      method: 'DELETE',
    });
  }

  // Checkout
  async checkout(data: CheckoutData) {
    return this.request('/sales/checkout/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Order management
  async getOrder(orderId: string) {
    return this.request(`/sales/${orderId}/`);
  }

  async getOrders() {
    return this.request('/sales/');
  }
}

export const orderApiService = new OrderApiService();