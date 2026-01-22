export interface Product {
  id: string;
  name: string;
  brand_id?: string;
  brand_name?: string;
  supplier_id?: string;
  supplier_name?: string;
  quantity: number;
  price: number;
  description?: string;
  images: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ProductFormData {
  name: string;
  brand_id?: string;
  supplier_id?: string;
  quantity: number;
  price: number;
  description?: string;
  images: string[];
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  additional_info?: any;
  created_at: string;
  updated_at: string;
}