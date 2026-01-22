export interface Supplier {
  id: string;  // UUID from backend
  name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  additional_info?: any; // JSON field from backend
  created_at: string;
  updated_at: string;
  created_by?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface SupplierFormData {
  name: string;
  email: string;
  phone_number: string;
  address: string;
  additional_info: string;
}

// Helper function to format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Helper to format additional_info (JSON to string)
export const formatAdditionalInfo = (info: any): string => {
  if (!info) return '-';
  if (typeof info === 'string') return info;
  if (typeof info === 'object') {
    try {
      // Handle JSON object
      if (info.supplies) return info.supplies;
      if (info.notes) return info.notes;
      if (Array.isArray(info)) return info.join(', ');
      return JSON.stringify(info, null, 2);
    } catch {
      return String(info);
    }
  }
  return String(info);
};

export interface Purchase {
  id: string;
  supplier_id: string;
  supplier_name: string;
  product_name: string;
  quantity: number;
  amount: number;
  date: string;
  notes?: string;
  created_at: string;
}

export const SUPPLIERS_KEY = 'incontrol_suppliers_v1';
export const PURCHASES_KEY = 'incontrol_purchases_v1';
