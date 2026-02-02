"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import InventoryForm from "./InventoryForm";
import { inventoryApi } from "@/lib/api/inventoryApi";
import type { InventoryItem } from "./types";

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStock, setFilterStock] = useState<"all" | "low">("all");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.list();
      setInventory(data);
      setFilteredInventory(data);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let data = [...inventory];

    if (searchTerm) {
      data = data.filter(
        (i) =>
          i.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterBrand) {
      data = data.filter((i) => i.brand_name === filterBrand);
    }

    if (filterStock === "low") {
      data = data.filter((i) => i.quantity_in_stock < 10);
    }

    setFilteredInventory(data);
  }, [inventory, searchTerm, filterBrand, filterStock]);

  const handleSave = async () => {
    await fetchInventory();
    setShowForm(false);
    setEditingItem(null);
    toast.success("Saved successfully");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    await inventoryApi.delete(id);
    fetchInventory();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <ToastContainer />
      <button onClick={() => setShowForm(true)}>Add Item</button>

      <AnimatePresence>
        {showForm && (
          <InventoryForm
            item={editingItem ?? undefined}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {filteredInventory.map((item) => (
        <div key={item.id}>
          <strong>{item.brand_name}</strong>
          <button onClick={() => setEditingItem(item)}>Edit</button>
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
