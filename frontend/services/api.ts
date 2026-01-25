import { apiClient } from "@/lib/apiClient";

export const apiService = {
  getCustomerProducts: () =>
    apiClient.get<any[]>("/api/products/public/"),
};
