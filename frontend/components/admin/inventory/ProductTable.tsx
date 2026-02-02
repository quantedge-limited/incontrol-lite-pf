"use client";

import { useState } from "react";
import { InventoryItem } from "./types"; // make sure this type is correct

interface ProductTableProps {
  products: InventoryItem[];
  // optionally, pass categories if you want names instead of IDs
  categories?: { id: number; name: string }[];
}

export default function ProductTable({ products, categories }: ProductTableProps) {
  const [search, setSearch] = useState("");

  const filtered = products.filter(item =>
    item.brand_name.toLowerCase().includes(search.toLowerCase())
  );

  // helper to get category name from category_id
  const getCategoryName = (categoryId: number) => {
    if (!categories) return categoryId; // fallback to ID if no category list
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(item => (
            <tr key={item.id}>
              <td className="border p-2">{item.brand_name}</td>
              {/* <td className="border p-2">{getCategoryName(item.category_name)}</td> */}
              <td className="border p-2">{item.quantity_in_stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
