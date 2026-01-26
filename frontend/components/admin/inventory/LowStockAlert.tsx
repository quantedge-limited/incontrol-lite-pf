// components/admin/inventory/LowStockAlert.tsx - CORRECTED
"use client";

import { Product } from './types';

export default function LowStockAlert({ products, threshold = 5 }: { products: Product[]; threshold?: number }) {
  // Use quantity_in_stock instead of quantity
  const low = products.filter((p) => p.quantity_in_stock <= threshold);
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
              {/* Use brand_name since that's what your Product interface has */}
              <div className="font-medium">{p.brand_name}</div>
              {/* Remove brand and supplier since they don't exist in Product interface */}
              <div className="text-xs text-amber-700">
                Price: KES {p.selling_price?.toLocaleString() || '0'}
              </div>
            </div>
            <div className="text-sm font-semibold">{p.quantity_in_stock} units</div>
          </li>
        ))}
      </ul>
    </div>
  );
}