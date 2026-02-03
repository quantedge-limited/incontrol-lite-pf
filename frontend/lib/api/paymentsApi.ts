// lib/api/paymentsApi.ts - Updated for Stripe integration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface Payment {
  id: number;
  sale: number; // Sale ID
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  created_at: string;
}

export interface CreatePaymentIntentRequest {
  sale_id: number;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  message?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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
    throw new Error(error.detail || error.message || 'Payment request failed');
  }

  return response.json();
}

export const paymentsApi = {
  // Create Stripe payment intent
  createPaymentIntent: (paymentData: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> =>
    apiRequest<CreatePaymentIntentResponse>('/payments/create-intent/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

  // Get payment by sale ID
  getPaymentBySale: (saleId: number): Promise<Payment> =>
    apiRequest<Payment>(`/payments/sale/${saleId}/`, {
      method: 'GET',
    }),

  // Get all payments
  getPayments: (): Promise<Payment[]> =>
    apiRequest<Payment[]>('/payments/', {
      method: 'GET',
    }),
};

// Stripe integration helper
export const stripeApi = {
  // Initialize Stripe
  initializeStripe: async () => {
    if (typeof window !== 'undefined' && !(window as any).Stripe) {
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      return stripe;
    }
    return (window as any).Stripe;
  },

  // Process payment with Stripe Elements
  processPayment: async (
    stripe: any,
    elements: any,
    clientSecret: string,
    redirectUrl?: string
  ): Promise<{ error?: string; paymentIntent?: any }> => {
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        return { error: submitError.message };
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: redirectUrl || `${window.location.origin}/payment/success`,
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { paymentIntent };
    } catch (error: any) {
      return { error: error.message || 'Payment processing failed' };
    }
  },

  // Check payment status
  checkPaymentStatus: async (stripe: any, paymentIntentId: string) => {
    try {
      const { paymentIntent } = await stripe.retrievePaymentIntent(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      return null;
    }
  },
};

// Payment status polling
export async function pollPaymentStatus(
  saleId: number,
  interval = 3000,
  maxAttempts = 20
): Promise<Payment> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const poll = async () => {
      attempts++;
      
      try {
        const payment = await paymentsApi.getPaymentBySale(saleId);
        
        // If payment is succeeded or failed, resolve
        if (payment.status === 'succeeded' || 
            payment.status === 'failed' ||
            attempts >= maxAttempts) {
          resolve(payment);
        } else {
          // Continue polling
          setTimeout(poll, interval);
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          reject(new Error('Payment status polling timeout'));
        } else {
          setTimeout(poll, interval);
        }
      }
    };
    
    poll();
  });
}