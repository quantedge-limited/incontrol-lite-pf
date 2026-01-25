import { apiClient } from '@/lib/apiClient';
import { AxiosResponse } from 'axios';

export interface PaymentResponse {
  payment: {
    id: string;
    status?: 'pending' | 'success' | 'failed';
    [key: string]: any;
  };
}

export interface PaymentStatusResponse {
  status: 'pending' | 'success' | 'failed';
  [key: string]: any;
}

// Initiate a payment
export const initiatePayment = async (data: any): Promise<PaymentResponse> => {
  const response: AxiosResponse<PaymentResponse> = await apiClient.post("/api/payments/initiate/", data);
  return response.data;
};

// Check payment status
export const checkPaymentStatus = async (paymentId: string): Promise<PaymentStatusResponse> => {
  const response: AxiosResponse<PaymentStatusResponse> = await apiClient.get(`/api/payments/status/${paymentId}/`);
  return response.data;
};
