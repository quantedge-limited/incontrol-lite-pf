export type Sale = {
  id: string;
  date: string; // ISO
  productId?: string;
  productName: string;
  supplier?: string;
  quantity: number;
  amount: number; // total amount for the line
};

export const SALES_STORAGE_KEY = 'incontrol_sales_v1';
