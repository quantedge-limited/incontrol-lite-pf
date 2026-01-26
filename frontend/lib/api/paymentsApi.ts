const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

import { authApi } from './authApi'; // Add this import

export interface Payment {
  id: string;
  sale: {
    id: string;
    total_amount: number;
  };
  client?: {
    id: string;
    name: string;
  };
  amount: number;
  phone_number: string;
  payment_method: 'mpesa' | 'cash' | 'card' | 'bank_transfer';
  status: 'pending' | 'success' | 'failed';
  stk_request_id?: string;
  checkout_time?: string;
  completed_at?: string;
  created_by?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentDto {
  sale_id?: string;
  client_id?: string;
  amount: number;
  phone_number: string;
  payment_method: 'mpesa' | 'cash' | 'card' | 'bank_transfer';
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Use authApi.getAuthHeaders() for consistent authentication
  const authHeaders = authApi.getAuthHeaders();
  
  // Merge headers properly
  const headers: HeadersInit = {
    ...authHeaders,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const paymentsApi = {
  // Create payment
  async create(paymentData: CreatePaymentDto): Promise<Payment> {
    return apiRequest<Payment>('/payments/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // Get all payments
  async list(): Promise<Payment[]> {
    return apiRequest<Payment[]>('/payments/');
  },

  // Get single payment
  async get(id: string): Promise<Payment> {
    return apiRequest<Payment>(`/payments/${id}/`);
  },

  // Delete payment
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/payments/${id}/delete/`, {
      method: 'DELETE',
    });
  },
};