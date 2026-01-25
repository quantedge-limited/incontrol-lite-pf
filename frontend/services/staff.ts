import { apiClient } from "../lib/apiClient";

export const registerAdmin = async (data: any) => {
  return apiClient.post("/api/staff/register/", data);
};

export const requestOTP = async (data: any) => {
  return apiClient.post("/api/staff/request-otp/", data);
};

export const verifyOTP = async (data: any) => {
  return apiClient.post("/api/staff/verify-otp/", data);
};

export const createSupplier = async (data: any) => {
  return apiClient.post("/api/staff/suppliers/create/", data);
};

export const listSuppliers = async () => {
  return apiClient.get("/api/staff/suppliers/");
};

export const getSupplier = async (supplierId: string) => {
  return apiClient.get(`/api/staff/suppliers/${supplierId}/`);
};

export const updateSupplier = async (supplierId: string, data: any) => {
  return apiClient.patch(`/api/staff/suppliers/${supplierId}/update/`, data);
};

export const deleteSupplier = async (supplierId: string) => {
  return apiClient.delete(`/api/staff/suppliers/${supplierId}/`);
};

export const createClient = async (data: any) => {
  return apiClient.post("/api/staff/clients/create/", data);
};

export const listClients = async () => {
  return apiClient.get("/api/staff/clients/");
};

export const getClient = async (clientId: string) => {
  return apiClient.get(`/api/staff/clients/${clientId}/`);
};

export const updateClient = async (clientId: string, data: any) => {
  return apiClient.patch(`/api/staff/clients/${clientId}/update/`, data);
};

export const deleteClient = async (clientId: string) => {
  return apiClient.delete(`/api/staff/clients/${clientId}/`);
};
