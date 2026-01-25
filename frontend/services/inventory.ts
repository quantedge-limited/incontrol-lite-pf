import { apiClient } from "../lib/apiClient";

export const createCategory = async (data: { name: string }) => {
  return apiClient.post("/api/inventory/categories/create/", data);
};

export const listCategories = async () => {
  return apiClient.get("/api/inventory/categories/");
};

export const createItem = async (data: any) => {
  return apiClient.post("/api/inventory/items/create/", data);
};

export const listItems = async () => {
  return apiClient.get("/api/inventory/items/");
};

export const getItemById = async (id: string) => {
  return apiClient.get(`/api/inventory/items/${id}/`);
};

export const updateItem = async (id: string, data: any) => {
  return apiClient.patch(`/api/inventory/items/${id}/update/`, data);
};

export const deleteItem = async (id: string) => {
  return apiClient.delete(`/api/inventory/items/${id}/`);
};
