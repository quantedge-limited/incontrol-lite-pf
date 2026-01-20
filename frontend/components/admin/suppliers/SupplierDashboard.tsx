"use client";

import { useEffect, useMemo, useState } from "react";
import { Supplier, SUPPLIERS_KEY, Purchase, PURCHASES_KEY } from "./types";
import SupplierForm from "./SupplierForm";
import SupplierTable from "./SupplierTable";
import SupplierDetails from "./SupplierDetails";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function loadSuppliers(): Supplier[] {
  try {
    const raw = localStorage.getItem(SUPPLIERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadPurchases(): Purchase[] {
  try {
    const raw = localStorage.getItem(PURCHASES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function SupplierDashboard() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadSuppliers);
  const [purchases, setPurchases] = useState<Purchase[]>(loadPurchases);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [showMobileTable, setShowMobileTable] = useState(false);

  /* ------------------ Persistence ------------------ */
  useEffect(() => {
    localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
  }, [purchases]);

  /* ------------------ Actions ------------------ */
  function addSupplier(s: Supplier) {
    setSuppliers((prev) => [s, ...prev]);
    toast.success("Supplier added");
  }

  function deleteSupplier(id: string) {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    }
  }

  function addPurchase(p: Purchase) {
    setPurchases((prev) => [p, ...prev]);
    toast.success("Purchase added");
  }

  /* ------------------ Derived Data ------------------ */
  const displayedSuppliers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? suppliers
      : suppliers.filter((s) =>
          `${s.name} ${s.contact} ${s.email} ${s.supplies}`
            .toLowerCase()
            .includes(q)
        );

    return filtered.slice(0, 10);
  }, [suppliers, query]);

  const summary = useMemo(() => {
    const map: Record<string, { totalPaid: number; items: number }> = {};
    purchases.forEach((p) => {
      map[p.supplierId] ??= { totalPaid: 0, items: 0 };
      map[p.supplierId].totalPaid += p.amount;
      map[p.supplierId].items += p.quantity;
    });
    return map;
  }, [purchases]);

  /* ------------------ UI ------------------ */
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-sm text-gray-600">
            Manage supplier details and purchases
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileTable(!showMobileTable)}
            className="xl:hidden px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm"
          >
            {showMobileTable ? "Hide List" : "View List"}
          </button>

          <span className="px-3 py-1 bg-emerald-50 rounded-full text-xs">
            Total: {suppliers.length}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white border rounded-xl">
            <div className="border-b px-5 py-4">
              <h3 className="text-xs font-bold uppercase">Add Supplier</h3>
            </div>
            <div className="p-5">
              <SupplierForm onSave={addSupplier} />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase">Quick Insights</h3>

            {displayedSuppliers.slice(0, 3).map((s) => (
              <div key={s.id} className="p-4 bg-white border rounded-xl">
                <div className="font-bold">{s.name}</div>
                <div className="flex justify-between text-xs mt-2">
                  <span>Paid</span>
                  <span>
                    ${(summary[s.id]?.totalPaid || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Stock Units</span>
                  <span>{summary[s.id]?.items || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div
          className={`xl:col-span-8 ${
            showMobileTable ? "block" : "hidden xl:block"
          }`}
        >
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="border-b px-5 py-4">
              <h3 className="text-xs font-bold uppercase">Vendor List</h3>
            </div>

            <SupplierTable
              suppliers={displayedSuppliers}
              onView={setSelected}
              onDelete={deleteSupplier}
              onSearch={setQuery}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <SupplierDetails
          supplier={selected}
          onClose={() => setSelected(null)}
          onAddPurchase={addPurchase}
        />
      )}
    </div>
  );
}
