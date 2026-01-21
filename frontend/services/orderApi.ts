// services/orderApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

interface CartItem {
  product_id: number;
  quantity: number;
}

interface CheckoutData {
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  customer_address: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

class OrderApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Cart operations
  async getCart() {
    return this.request('/orders/cart/');
  }

  async updateCart(items: CartItem[]) {
    return this.request('/orders/cart/', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  async clearCart() {
    return this.request('/orders/cart/', {
      method: 'DELETE',
    });
  }

  async addToCart(productId: number, quantity: number = 1) {
    return this.request('/orders/add-to-cart/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  // Checkout
  async checkout(data: CheckoutData) {
    return this.request('/orders/checkout/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Order management
  async getOrder(orderId: string) {
    return this.request(`/orders/${orderId}/`);
  }

  async getOrders() {
    return this.request('/orders/');
  }
}

export const orderApiService = new OrderApiService();