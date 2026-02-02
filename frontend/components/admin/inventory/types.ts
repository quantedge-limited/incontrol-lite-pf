export interface InventoryItem {
  id: number;

  brand_name: string;
  description?: string;

  /** STOCK */
  quantity_in_stock: number;

  /** PRICING */
  selling_price: number;
  cost_price?: number;

  /** CATEGORY */
  category: number;
  category_details?: {
    id: number;
    name: string;
    description?: string;
  };

  /** MEDIA */
  image?: string;

  /** STATE */
  is_active: boolean;

  /** TIMESTAMPS */
  created_at: string;
  updated_at: string;
}

export interface InventoryFormData {
  brand_name: string;
  description?: string;
  quantity_in_stock: number;
  selling_price: number;
  cost_price: number;
  category: number;
  is_active?: boolean;
}

export interface InventoryCategory {
  id: number;
  name: string;
  description?: string;
}
