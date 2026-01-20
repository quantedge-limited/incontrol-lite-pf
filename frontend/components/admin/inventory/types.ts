export type Product = {
  id: string;
  name: string;
  brand?: string;
  supplier?: string;
  quantity: number;
  price: number;
  description?: string;
  dateAdded: string; // ISO
};

export const STORAGE_KEY = 'incontrol_inventory_products_v1';
