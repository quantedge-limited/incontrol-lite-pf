"use client";

import { useEffect, useState } from "react";
import { inventoryApi } from "@/lib/api/inventoryApi";
import type { InventoryFormData, InventoryCategory, InventoryItem } from "./types";

interface Props {
  item?: InventoryItem;
  onSave: () => void;
  onCancel: () => void;
}

export default function InventoryForm({ item, onSave, onCancel }: Props) {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [formData, setFormData] = useState<InventoryFormData>({
    brand_name: item?.brand_name ?? "",
    description: item?.description ?? "",
    quantity_in_stock: item?.quantity_in_stock ?? 0,
    selling_price: item?.selling_price ?? 0,
    cost_price: item?.cost_price ?? 0,
    category: item?.category_details?.id ?? item?.category ?? 0,
    is_active: item?.is_active ?? true,
  });

  useEffect(() => {
    inventoryApi.getCategories().then(setCategories);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (item) {
      await inventoryApi.update(item.id, formData);
    } else {
      await inventoryApi.create(formData);
    }
    onSave();
  };

  return (
    <form onSubmit={submit}>
      <input
        value={formData.brand_name}
        onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
        required
      />

      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: Number(e.target.value) })}
        required
      >
        <option value={0}>Select Category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
