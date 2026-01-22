const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface Product {
  id: string;
  name: string;
  brand?: string;
  brand_id?: string;
  brand_name?: string;
  supplier?: string;
  supplier_id?: string;
  supplier_name?: string;
  quantity: number;
  price: number;
  description?: string;
  images: string[];  // Base64 images
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

export const productApi = {
  // Create product
  async create(productData: ProductFormData): Promise<Product> {
    const res = await fetch(`${API_BASE}/inventory/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({
        ...productData,
        // Map frontend fields to backend fields
        quantity: productData.quantity,
        price_per_unit: productData.price,
        name: productData.name,
        description: productData.description,
        brand: productData.brand_id,
        supplier: productData.supplier_id,
      }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to create product');
    }
    return await res.json();
  },

  // List all products
  async list(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/inventory/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    
    // Transform backend data to frontend format
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      brand_id: item.brand?.id,
      brand_name: item.brand?.name || item.brand_name,
      supplier_id: item.supplier?.id,
      supplier_name: item.supplier?.name || item.supplier_name,
      quantity: item.quantity,
      price: item.price_per_unit,
      description: item.description,
      images: item.images || [],  // You'll need to add images to your Inventory model
      created_at: item.created_at,
      updated_at: item.updated_at,
      is_active: true,
    }));
  },

  // Update product
  async update(id: string, productData: Partial<ProductFormData>): Promise<Product> {
    const res = await fetch(`${API_BASE}/inventory/${id}/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({
        ...productData,
        price_per_unit: productData.price,
        brand: productData.brand_id,
        supplier: productData.supplier_id,
      }),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return await res.json();
  },

  // Delete product
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/inventory/${id}/delete/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to delete product');
  },
};