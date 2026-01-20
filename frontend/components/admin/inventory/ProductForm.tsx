"use client";

import { useState } from 'react';
import { Product } from './types';

export default function ProductForm({ onSave }: { onSave: (p: Product) => void }) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [supplier, setSupplier] = useState('');
  const [qty, setQty] = useState(0);
  const [price, setPrice] = useState(0);
  const [desc, setDesc] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const product: Product = {
      id: `p-${Date.now()}`,
      name: name || 'Unnamed',
      brand: brand || undefined,
      supplier: supplier || undefined,
      quantity: qty,
      price: price,
      description: desc,
      dateAdded: new Date().toISOString(),
    };
    onSave(product);
    setName('');
    setBrand('');
    setSupplier('');
    setQty(0);
    setPrice(0);
    setDesc('');
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-sm text-emerald-700">Name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm text-emerald-700">Brand</label>
        <input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm text-emerald-700">Supplier</label>
        <input value={supplier} onChange={(e) => setSupplier(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm text-emerald-700">Quantity</label>
          <input type="number" min={0} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="mt-1 block w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm text-emerald-700">Price</label>
          <input type="number" step="0.01" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-1 block w-full border rounded px-2 py-1" />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm text-emerald-700">Description</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
      </div>

      <div className="sm:col-span-2 flex justify-end">
        <button type="submit" className="px-4 py-2 bg-emerald-800 text-white rounded">Save Product</button>
      </div>
    </form>
  );
}
