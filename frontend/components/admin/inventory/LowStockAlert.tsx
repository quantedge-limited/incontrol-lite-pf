"use client";

import { InventoryItem } from "./types"; 

interface LowStockAlertProps {
  products: InventoryItem[];
}

export default function LowStockAlert({ products }: LowStockAlertProps) {
  const lowStock = products.filter(item => item.quantity_in_stock < 5);

  if (lowStock.length === 0) return null;

  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
      <p className="font-bold">Low Stock Alert</p>
      <ul className="list-disc list-inside">
        {lowStock.map(item => (
          <li key={item.id}>
            {item.brand_name} ({item.quantity_in_stock} in stock)
          </li>
        ))}
      </ul>
    </div>
  );
}
