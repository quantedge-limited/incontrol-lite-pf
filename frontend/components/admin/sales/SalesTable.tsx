"use client";

import { Sale } from './types';
import { useState } from 'react';

export default function SalesTable({ sales, onDelete }: { sales: Sale[]; onDelete?: (id: string) => void }) {
  const [q, setQ] = useState('');
  const total = sales.reduce((s, x) => s + x.amount, 0);

  const filtered = sales.filter((s) => (`${s.productName} ${s.supplier || ''}`).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <input placeholder="Search ..." value={q} onChange={(e)=>setQ(e.target.value)} className=" border-gray-300 rounded px-3 py-2 w-64" />
      </div>

      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-emerald-700">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Phone number</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 text-gray-600">{new Date(s.date).toLocaleString()}</td>
                <td className="px-3 py-3 text-emerald-900">{s.productName}</td>
                <td className="px-3 py-3 text-emerald-700">{s.supplier || '-'}</td>
                <td className="px-3 py-3">{s.quantity}</td>
                <td className="px-3 py-3 font-medium text-emerald-800">${s.amount.toFixed(2)}</td>
                <td className="px-3 py-3">
                  {onDelete ? (
                    <button onClick={()=>onDelete(s.id)} className="text-sm text-red-600">Delete</button>
                  ) : (
                    <span className="text-sm text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="px-3 py-3 text-right text-sm font-semibold text-gray-600">Total</td>
              <td className="px-3 py-3 font-semibold text-emerald-900">${total.toFixed(2)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
