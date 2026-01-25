import { apiClient } from "../lib/apiClient";
import { AxiosResponse } from "axios";

export interface Sale {
  id: string;
  customer_name?: string;
  total_amount: number;
  items: {
    product_id: number;
    quantity: number;
    price: number;
  }[];
  created_at: string;
  [key: string]: any;
}


// Create a sale
export const createSale = async (data: any): Promise<Sale> => {
  const response: AxiosResponse<Sale> = await apiClient.post("/api/pos/sales/create/", data);
  return response.data;
};

// List all sales
export const listSales = async (): Promise<Sale[]> => {
  const response: AxiosResponse<Sale[]> = await apiClient.get("/api/pos/sales/");
  return response.data;
};

// Get a specific sale
export const getSale = async (saleId: string): Promise<Sale> => {
  const response: AxiosResponse<Sale> = await apiClient.get(`/api/pos/sales/${saleId}/`);
  return response.data;
};
