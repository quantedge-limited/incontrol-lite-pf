"use client";

import { Product } from './types';

export default function LowStockAlert({ products, threshold = 5 }: { products: Product[]; threshold?: number }) {
  const low = products.filter((p) => p.quantity <= threshold);
  if (low.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-amber-800">Low Stock Alerts</h3>
          <p className="text-xs text-amber-700">{low.length} product(s) at or below {threshold} units</p>
        </div>
      </div>

      <ul className="mt-3 space-y-2 text-sm text-amber-800">
        {low.map((p) => (
          <li key={p.id} className="flex items-center justify-between bg-amber-100/50 px-3 py-2 rounded">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-amber-700">{p.brand || p.supplier || ''}</div>
            </div>
            <div className="text-sm font-semibold">{p.quantity}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
