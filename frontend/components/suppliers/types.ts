export type Supplier = {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  address?: string;
  supplies?: string; // brief description of products they supply
  dateAdded: string;
};

export type Purchase = {
  id: string;
  supplierId: string;
  date: string; // ISO
  productName: string;
  quantity: number;
  amount: number; // total paid for this line
};

export const SUPPLIERS_KEY = 'incontrol_suppliers_v1';
export const PURCHASES_KEY = 'incontrol_purchases_v1';
