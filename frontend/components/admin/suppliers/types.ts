
{/*
  
  Supplier interface defines the structure of a supplier object.
  The id field is a UUID string.
  The email, phone_number, and address fields are optional and can be null.
  The additional_info field is any type and can be null.
  The created_at and updated_at fields are ISO date strings.
  The created_by field is an object with id, email, first_name, and last_name fields.
  
  */}

export interface Supplier {
  id: string; 
  name: string;
  email?: string|null;
  phone_number?: string|null;
  address?: string|null;
  additional_info?: any;
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
  email?: string | null; 
  phone_number?: string | null;  
  address?: string | null;  
  additional_info?: any | null;  
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