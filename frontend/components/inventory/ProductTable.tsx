"use client";

import { Product } from './types';
import { useState } from 'react';

export default function ProductTable({
  products,
  onDelete,
  onUpdate,
}: {
  products: Product[];
  onDelete: (id: string) => void;
  onUpdate: (p: Product) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditQty(p.quantity);
  }

  function saveEdit(id: string) {
    onUpdate({ ...products.find((x) => x.id === id)!, quantity: editQty } as Product);
    setEditingId(null);
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="text-left text-sm text-emerald-700">
            <th className="px-3 py-2">Product</th>
            <th className="px-3 py-2">Brand</th>
            <th className="px-3 py-2">Supplier</th>
            <th className="px-3 py-2">Price</th>
            <th className="px-3 py-2">Quantity</th>
            <th className="px-3 py-2">Date Added</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-3 py-3 align-top">
                <div className="text-sm font-medium text-emerald-900">{p.name}</div>
                <div className="text-xs text-gray-500">{p.description}</div>
              </td>
              <td className="px-3 py-3 text-sm text-emerald-700">{p.brand || '-'}</td>
              <td className="px-3 py-3 text-sm text-emerald-700">{p.supplier || '-'}</td>
              <td className="px-3 py-3 text-sm text-emerald-800">${p.price.toFixed(2)}</td>
              <td className="px-3 py-3 text-sm">
                {editingId === p.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editQty}
                      min={0}
                      onChange={(e) => setEditQty(Number(e.target.value))}
                      className="w-20 px-2 py-1 border rounded"
                    />
                    <button onClick={() => saveEdit(p.id)} className="text-sm text-emerald-700">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-sm text-gray-500">Cancel</button>
                  </div>
                ) : (
                  <div className={`inline-block px-2 py-1 rounded ${p.quantity <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                    {p.quantity}
                  </div>
                )}
              </td>
              <td className="px-3 py-3 text-sm text-gray-500">{new Date(p.dateAdded).toLocaleString()}</td>
              <td className="px-3 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(p)} className="text-sm text-emerald-700">Edit</button>
                  <button onClick={() => onDelete(p.id)} className="text-sm text-red-600">Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="px-3 py-6 text-center text-sm text-gray-500">No products found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
