"use client";

import { useEffect, useMemo, useState } from 'react';
import ProductTable from './ProductTable';
import ProductForm from './ProductForm';
import LowStockAlert from './LowStockAlert';
import Filters from './Filters';
import { Product, STORAGE_KEY } from './types';
// 1. Added Toastify imports
import { toast, ToastContainer } from 'react-toastify';


// Matching your business menu context (fries, fish, beverages, chicken)
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Frozen Skin-on Fries',
    brand: 'Farm Select',
    supplier: 'Fresh Foods Ltd',
    quantity: 45,
    price: 15.50,
    description: 'Bulk 5kg bags',
    dateAdded: new Date().toISOString(),
  },
  {
    id: 'p-2',
    name: 'Tilapia Fillets',
    brand: 'Ocean Catch',
    supplier: 'Lake Side Trade',
    quantity: 3,
    price: 120.00,
    description: 'Fresh frozen fillets',
    dateAdded: new Date().toISOString(),
  },
];

export default function InventoryDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [supplierFilter, setSupplierFilter] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showMobileTable, setShowMobileTable] = useState(false);

  const LOW_STOCK_THRESHOLD = 5;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setProducts(JSON.parse(raw));
      else {
        setProducts(SAMPLE_PRODUCTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_PRODUCTS));
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setProducts(SAMPLE_PRODUCTS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  // Analytics for the widgets
  const stats = useMemo(() => {
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= LOW_STOCK_THRESHOLD).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    const inStock = products.filter(p => p.quantity > LOW_STOCK_THRESHOLD).length;
    return { totalValue, lowStock, outOfStock, inStock };
  }, [products]);

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand).filter(Boolean) as string[])), [products]);
  const suppliers = useMemo(() => Array.from(new Set(products.map((p) => p.supplier).filter(Boolean) as string[])), [products]);

  function handleAdd(product: Product) {
    setProducts((s) => [product, ...s]);
    setIsAdding(false);
    toast.success("Product added successfully!");
  }

  // 2. Modified handleDelete to include confirmation logic
  function handleDelete(id: string) {
    const confirmDelete = ({ closeToast }: { closeToast: () => void }) => (
      <div className="p-1">
        <p className="text-sm font-medium mb-3">Are you sure you want to delete this inventory item?</p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={closeToast}
            className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              setProducts((s) => s.filter((p) => p.id !== id));
              toast.success("Item deleted.");
              closeToast();
            }}
            className="px-3 py-1 text-xs bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    );

    toast.warn(confirmDelete, {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    });
  }

  function handleUpdate(updated: Product) {
    setProducts((s) => s.map((p) => (p.id === updated.id ? updated : p)));
    toast.info("Inventory updated.");
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (brandFilter && p.brand !== brandFilter) return false;
      if (supplierFilter && p.supplier !== supplierFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return `${p.name} ${p.brand} ${p.supplier}`.toLowerCase().includes(q);
      }
      return true;
    }).slice(0, 10); // Keeping the Top 10 rhyme
  }, [products, brandFilter, supplierFilter, query]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-950">Inventory Directory</h1>
          <p className="text-emerald-600 mt-1 text-sm">Manage products, suppliers and stock levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileTable(!showMobileTable)}
            className="xl:hidden px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
          >
            {showMobileTable ? 'Hide Table' : 'View Table'}
          </button>
          <button
            onClick={() => setIsAdding((s) => !s)}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-950 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
          >
            {isAdding ? 'Close Form' : 'Add Product'}
          </button>
        </div>
      </div>

      {/* Inventory Status Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-emerald-100 p-4 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">In Stock</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.inStock}</p>
        </div>
        <div className="bg-white border border-emerald-100 p-4 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Low Stock</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{stats.lowStock}</p>
        </div>
        <div className="bg-white border border-rose-100 p-4 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">Out of Stock</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{stats.outOfStock}</p>
        </div>
        <div className="bg-emerald-900 p-4 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">Total Value</p>
          <p className="text-2xl font-bold text-white mt-1">${stats.totalValue.toLocaleString()}</p>
        </div>
      </div>

      <LowStockAlert products={products} threshold={LOW_STOCK_THRESHOLD} />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Filters and Add Form */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden p-5">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4">Search & Filter</h3>
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
          </div>

          {isAdding && (
            <div className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-top-4 duration-300">
              <div className="bg-emerald-50/50 border-b border-emerald-100 px-5 py-4">
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">New Product Registration</h3>
              </div>
              <div className="p-5">
                <ProductForm onSave={handleAdd} />
              </div>
            </div>
          )}
        </div>

        {/* Product Table */}
        <div className={`xl:col-span-8 ${showMobileTable ? 'block' : 'hidden xl:block'}`}>
          <div className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-emerald-50/50 border-b border-emerald-100 px-5 py-4 flex justify-between items-center">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Recent Stock Entries</h3>
              <span className="text-[10px] text-emerald-600 font-medium">Top 10 Displayed</span>
            </div>
            <div className="p-0 overflow-x-auto">
              <ProductTable products={filtered} onDelete={handleDelete} onUpdate={handleUpdate} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
