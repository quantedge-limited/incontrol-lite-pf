// lib/api/paymentsApi.ts - Updated for M-Pesa integration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Payment {
  id: number;
  sale: number; // Sale ID
  transaction_id?: string;        // M-Pesa CheckoutRequestID
  merchant_request_id?: string;
  checkout_request_id?: string;
  phone_number: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
}

export interface CreateMpesaPaymentRequest {
  sale_id: number;
  phone_number: string;
  amount?: number;
  description?: string;
}

export interface CreateMpesaPaymentResponse {
  success: boolean;
  message?: string;
  checkout_request_id?: string;
  transaction_id?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token');
  
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (token) headers['Authorization'] = `Bearer ${token}`;

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
  // Initiate M-Pesa payment (STK Push)
  initiatePayment: (paymentData: CreateMpesaPaymentRequest): Promise<CreateMpesaPaymentResponse> =>
    apiRequest<CreateMpesaPaymentResponse>('/payments/create-payment/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

  // Check M-Pesa payment status by CheckoutRequestID
  checkPaymentStatus: (checkoutRequestId: string): Promise<Payment> =>
    apiRequest<Payment>(`/payments/mpesa-status/${checkoutRequestId}/`, {
      method: 'GET',
    }),

  // Get payment by sale ID
  getPaymentBySale: (saleId: number): Promise<Payment> =>
    apiRequest<Payment>(`/payments/sale/${saleId}/`, {
      method: 'GET',
    }),

  // Get all payments
  getPayments: (): Promise<Payment[]> =>
    apiRequest<Payment[]>('/payments/', { method: 'GET' }),
};

// M-Pesa payment status polling
export async function pollPaymentStatus(
  checkoutRequestId: string,
  interval = 3000,
  maxAttempts = 20
): Promise<Payment> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const poll = async () => {
      attempts++;
      try {
        const payment = await paymentsApi.checkPaymentStatus(checkoutRequestId);

        // Resolve if completed, failed, or max attempts reached
        if (payment.status === 'success' || payment.status === 'failed' || attempts >= maxAttempts) {
          resolve(payment);
        } else {
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
