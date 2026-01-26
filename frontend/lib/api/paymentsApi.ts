// lib/api/paymentsApi.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com/api';

export interface Payment {
  id: string;
  order: string; // This is the order ID (UUID)
  phone_number: string;
  amount: number;
  status: string;
  mpesa_receipt_number?: string;
  created_at: string;
}

export interface InitiatePaymentRequest {
  order_id: string; // UUID string
  phone_number: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  message: string;
  checkout_request_id?: string;
  merchant_request_id?: string;
  payment?: Payment;
}

export interface PaymentStatusResponse {
  success: boolean;
  message: string;
  payment: Payment;
}

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
    throw new Error(error.detail || error.message || 'Payment request failed');
  }

  // Handle empty responses (like for DELETE)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const paymentsApi = {
  // Initiate M-Pesa payment
  initiatePayment: (paymentData: InitiatePaymentRequest): Promise<InitiatePaymentResponse> =>
    apiRequest<InitiatePaymentResponse>('/payments/initiate/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

  // Check payment status by order ID
  checkPaymentStatus: (orderId: string): Promise<PaymentStatusResponse> =>
    apiRequest<PaymentStatusResponse>(`/payments/status/${orderId}/`, {
      method: 'GET',
    }),

  // Get payment by ID
  getPayment: (paymentId: string): Promise<Payment> =>
    apiRequest<Payment>(`/payments/${paymentId}/`, {
      method: 'GET',
    }),

  // Get all payments
  getPayments: (): Promise<Payment[]> =>
    apiRequest<Payment[]>('/payments/', {
      method: 'GET',
    }),

  // Note: The M-Pesa callback endpoint is for backend use only
  // Frontend doesn't call this directly
};

// Helper function to poll payment status (for real-time updates)
export async function pollPaymentStatus(
  orderId: string,
  interval = 5000,
  maxAttempts = 12
): Promise<PaymentStatusResponse> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const poll = async () => {
      attempts++;
      
      try {
        const response = await paymentsApi.checkPaymentStatus(orderId);
        
        // If payment is completed or failed, resolve
        if (response.payment.status === 'completed' || 
            response.payment.status === 'failed' ||
            attempts >= maxAttempts) {
          resolve(response);
        } else {
          // Continue polling
          setTimeout(poll, interval);
        }
      } catch (error) {
        // If we've reached max attempts or got an error, reject
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