"use client";

import { useEffect, useMemo, useState } from 'react';
import ProductTable from './ProductTable';
import ProductForm from './ProductForm';
import LowStockAlert from './LowStockAlert';
import Filters from './Filters';
import { Product, STORAGE_KEY } from './types';

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Hydrating Serum',
    brand: 'Acme Beauty',
    supplier: 'Acme Suppliers',
    quantity: 12,
    price: 19.99,
    description: 'Lightweight hydrating serum',
    dateAdded: new Date().toISOString(),
  },
  {
    id: 'p-2',
    name: 'Daily Cleanser',
    brand: 'Pure Labs',
    supplier: 'Pure Trade',
    quantity: 3,
    price: 9.5,
    description: 'Foaming cleanser',
    dateAdded: new Date().toISOString(),
  },
];

export default function InventoryDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [supplierFilter, setSupplierFilter] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProducts(JSON.parse(raw));
      else {
        setProducts(SAMPLE_PRODUCTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_PRODUCTS));
      }
    } catch (e) {
      setProducts(SAMPLE_PRODUCTS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand).filter(Boolean) as string[])), [products]);
  const suppliers = useMemo(() => Array.from(new Set(products.map((p) => p.supplier).filter(Boolean) as string[])), [products]);

  function handleAdd(product: Product) {
    setProducts((s) => [product, ...s]);
    setIsAdding(false);
  }

  function handleDelete(id: string) {
    setProducts((s) => s.filter((p) => p.id !== id));
  }

  function handleUpdate(updated: Product) {
    setProducts((s) => s.map((p) => (p.id === updated.id ? updated : p)));
  }

  const filtered = products.filter((p) => {
    if (brandFilter && p.brand !== brandFilter) return false;
    if (supplierFilter && p.supplier !== supplierFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!(`${p.name} ${p.brand} ${p.supplier} ${p.description}`.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-emerald-900">Inventory</h1>
          <p className="text-sm text-emerald-600">Manage products, suppliers and stock levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdding((s) => !s)}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded shadow"
          >
            {isAdding ? 'Close' : 'Add Product'}
          </button>
        </div>
      </div>

      <LowStockAlert products={products} threshold={5} />

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <Filters
          query={query}
          onQuery={setQuery}
          brands={brands}
          suppliers={suppliers}
          brand={brandFilter}
          supplier={supplierFilter}
          onBrand={setBrandFilter}
          onSupplier={setSupplierFilter}
        />

        {isAdding && (
          <div className="mt-4">
            <ProductForm onSave={handleAdd} />
          </div>
        )}

        <div className="mt-4">
          <ProductTable products={filtered} onDelete={handleDelete} onUpdate={handleUpdate} />
        </div>
      </div>
    </div>
  );
}
