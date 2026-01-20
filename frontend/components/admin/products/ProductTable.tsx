"use client";

import { Product } from './types';
import { Edit2, Trash2 } from 'lucide-react';

export default function ProductTable({
  products,
  onDelete,
  onEdit,
}: {
  products: Product[];
  onDelete: (id: string) => void;
  onEdit: (p: Product) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr className="text-left text-sm text-emerald-700">
            <th className="px-6 py-3 font-medium">Product</th>
            <th className="px-6 py-3 font-medium">Brand</th>
            <th className="px-6 py-3 font-medium">Supplier</th>
            <th className="px-6 py-3 font-medium">Price</th>
            <th className="px-6 py-3 font-medium">Quantity</th>
            <th className="px-6 py-3 font-medium">Date Added</th>
            <th className="px-6 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-emerald-900">{p.name}</div>
                <div className="text-xs text-gray-500">{p.description}</div>
              </td>
              <td className="px-6 py-4 text-sm text-emerald-700">{p.brand || '-'}</td>
              <td className="px-6 py-4 text-sm text-emerald-700">{p.supplier || '-'}</td>
              <td className="px-6 py-4 text-sm text-emerald-800">${p.price.toFixed(2)}</td>
              <td className="px-6 py-4 text-sm">
                <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${p.quantity <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                  {p.quantity}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.dateAdded).toLocaleString()}</td>
              <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(p)} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded transition">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">No products found. Start by adding one.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
