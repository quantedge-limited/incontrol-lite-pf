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
  const [showMobileTable, setShowMobileTable] = useState(false);

  useEffect(()=>{ try{ localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers)); }catch{} }, [suppliers]);
  useEffect(()=>{ try{ localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases)); }catch{} }, [purchases]);

  function addSupplier(s: Supplier){ setSuppliers((sarr) => [s, ...sarr]); }

  function deleteSupplier(id: string){ 
    const confirmed = window.confirm("Are you sure you would love to delete the respective supplier?");
    if (confirmed) {
      setSuppliers((arr)=>arr.filter(x=>x.id!==id)); 
    }
  }

  function addPurchase(p: Purchase){ setPurchases((arr)=> [p, ...arr]); }

  // Logic: Filter and Show Top 10
  const displayedSuppliers = useMemo(()=>{
    const q = query.trim().toLowerCase();
    const filtered = !q 
      ? suppliers 
      : suppliers.filter(s => `${s.name} ${s.contact} ${s.email} ${s.supplies}`.toLowerCase().includes(q));
    
    return filtered.slice(0, 10);
  }, [suppliers, query]);

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
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-950">Suppliers</h1>
          <p className="text-emerald-600 mt-1 text-sm">
            Manage supplier details and incoming purchases
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMobileTable(!showMobileTable)}
            className="xl:hidden px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            {showMobileTable ? 'Hide List' : 'View List'}
          </button>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-medium">
            Total: {suppliers.length}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Form & Quick Summary */}
        <div className="xl:col-span-4 space-y-6">
          {/* Registration Card */}
          <div className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-emerald-50/50 border-b border-emerald-100 px-5 py-4">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Add Supplier</h3>
            </div>
            <div className="p-5">
              <SupplierForm onSave={addSupplier} />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest px-1">Quick Insights</h3>
            <div className="grid grid-cols-1 gap-3">
              {displayedSuppliers.slice(0, 3).map(s => (
                <div key={s.id} className="p-4 bg-white border border-emerald-50 rounded-xl shadow-sm hover:border-emerald-200 transition-colors">
                  <div className="text-sm font-bold text-emerald-900">{s.name}</div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-emerald-600/70 uppercase">Paid</span>
                    <span className="text-xs font-bold text-emerald-800">${(summary[s.id]?.totalPaid||0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-emerald-600/70 uppercase">Stock Units</span>
                    <span className="text-xs font-semibold text-emerald-700">{summary[s.id]?.items||0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Supplier Table */}
        <div className={`xl:col-span-8 ${showMobileTable ? 'block' : 'hidden xl:block'}`}>
          <div className="bg-white border border-emerald-100 shadow-sm overflow-hidden">
            <div className="bg-emerald-50/50 border-b border-emerald-100 px-5 py-4">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Vendor List</h3>
            </div>
            <div className="p-0 overflow-x-auto">
              <SupplierTable 
                suppliers={displayedSuppliers} 
                onView={(s)=>setSelected(s)} 
                onDelete={deleteSupplier} 
                onSearch={setQuery} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal Overlay */}
      {selected && (
        <SupplierDetails 
          supplier={selected} 
          onClose={()=>setSelected(null)} 
          onAddPurchase={(p)=>{ addPurchase(p); }} 
        />
      )}
    </div>
  );
}