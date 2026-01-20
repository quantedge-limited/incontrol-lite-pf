"use client";

import { Supplier } from './types';

export default function SupplierTable({
  suppliers,
  onView,
  onDelete,
  onSearch,
}: {
  suppliers: Supplier[];
  onView: (s: Supplier) => void;
  onDelete: (id: string) => void;
  onSearch: (q: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <input placeholder="Search suppliers..." onChange={(e) => onSearch(e.target.value)} className="border rounded px-3 py-2 w-64" />
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-emerald-700">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Supplies</th>
              <th className="px-3 py-2">Date Added</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 text-emerald-900">{s.name}</td>
                <td className="px-3 py-3 text-gray-600">{s.contact || s.email || '-'}</td>
                <td className="px-3 py-3 text-emerald-700">{s.supplies || '-'}</td>
                <td className="px-3 py-3 text-gray-500">{new Date(s.dateAdded).toLocaleDateString()}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => onView(s)} className="text-sm text-emerald-700">View</button>
                    <button onClick={() => onDelete(s.id)} className="text-sm text-red-600">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-gray-500">No suppliers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
