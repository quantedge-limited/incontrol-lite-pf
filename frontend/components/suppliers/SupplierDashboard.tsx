"use client";

import { useEffect, useMemo, useState } from 'react';
import { Supplier, SUPPLIERS_KEY, Purchase, PURCHASES_KEY } from './types';
import SupplierForm from './SupplierForm';
import SupplierTable from './SupplierTable';
import SupplierDetails from './SupplierDetails';

function loadSuppliers(): Supplier[] {
  try {
    const raw = localStorage.getItem(SUPPLIERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function loadPurchases(): Purchase[] {
  try { const raw = localStorage.getItem(PURCHASES_KEY); return raw?JSON.parse(raw):[]; } catch { return []; }
}

export default function SupplierDashboard(){
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadSuppliers());
  const [purchases, setPurchases] = useState<Purchase[]>(() => loadPurchases());
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Supplier | null>(null);

  useEffect(()=>{ try{ localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers)); }catch{} }, [suppliers]);
  useEffect(()=>{ try{ localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases)); }catch{} }, [purchases]);

  function addSupplier(s: Supplier){ setSuppliers((sarr) => [s, ...sarr]); }
  function deleteSupplier(id: string){ setSuppliers((arr)=>arr.filter(x=>x.id!==id)); }

  function addPurchase(p: Purchase){ setPurchases((arr)=> [p, ...arr]); }

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase();
    if(!q) return suppliers;
    return suppliers.filter(s => `${s.name} ${s.contact} ${s.email} ${s.supplies}`.toLowerCase().includes(q));
  }, [suppliers, query]);

  // aggregated per supplier summary
  const summary = useMemo(()=>{
    const map: Record<string, { totalPaid:number, items:number }> = {};
    purchases.forEach(p=>{
      map[p.supplierId] ??= { totalPaid:0, items:0 };
      map[p.supplierId].totalPaid += p.amount;
      map[p.supplierId].items += p.quantity;
    });
    return map;
  }, [purchases]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-emerald-900">Suppliers</h1>
          <p className="text-sm text-emerald-600">Manage supplier details and incoming purchases.</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <h3 className="text-sm font-medium text-emerald-800 mb-2">Add Supplier</h3>
            <SupplierForm onSave={addSupplier} />
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-emerald-800 mb-2">Suppliers</h3>
            <SupplierTable suppliers={filtered} onView={(s)=>setSelected(s)} onDelete={deleteSupplier} onSearch={setQuery} />

            <div className="mt-4">
              <h4 className="text-sm font-medium text-emerald-800 mb-2">Quick Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {filtered.slice(0,3).map(s => (
                  <div key={s.id} className="p-3 border rounded">
                    <div className="text-sm font-semibold text-emerald-900">{s.name}</div>
                    <div className="text-xs text-gray-600">Paid: <span className="font-medium text-emerald-800">${(summary[s.id]?.totalPaid||0).toFixed(2)}</span></div>
                    <div className="text-xs text-gray-600">Items: <span className="font-medium">{summary[s.id]?.items||0}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <SupplierDetails supplier={selected} onClose={()=>setSelected(null)} onAddPurchase={(p)=>{ addPurchase(p); }} />
      )}
    </div>
  );
}
