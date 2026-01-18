"use client";

import { useMemo, useState } from 'react';
import { Supplier, Purchase, PURCHASES_KEY } from './types';

export default function SupplierDetails({ supplier, onClose, onAddPurchase }:{ supplier: Supplier; onClose: ()=>void; onAddPurchase: (p: Purchase)=>void }){
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(0);

  const purchases: Purchase[] = useMemo(()=>{
    try{
      const raw = localStorage.getItem(PURCHASES_KEY);
      if(!raw) return [];
      return JSON.parse(raw).filter((p: Purchase)=>p.supplierId===supplier.id);
    }catch{ return []; }
  }, [supplier.id]);

  const totalPaid = purchases.reduce((s,p)=>s+p.amount,0);

  function submit(e: React.FormEvent){
    e.preventDefault();
    const p: Purchase = {
      id: `pu-${Date.now()}`,
      supplierId: supplier.id,
      date: new Date().toISOString(),
      productName: productName || 'Unknown',
      quantity,
      amount: amount,
    };
    try{
      const raw = localStorage.getItem(PURCHASES_KEY);
      const arr = raw?JSON.parse(raw):[];
      arr.unshift(p);
      localStorage.setItem(PURCHASES_KEY, JSON.stringify(arr));
    }catch{}
    onAddPurchase(p);
    setProductName(''); setQuantity(1); setAmount(0);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="bg-white w-full max-w-3xl rounded shadow-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-emerald-900">{supplier.name}</h3>
            <div className="text-sm text-gray-600">{supplier.contact} {supplier.email && `• ${supplier.email}`}</div>
          </div>
          <div className="text-sm text-gray-500">Added {new Date(supplier.dateAdded).toLocaleDateString()}</div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-emerald-800">Supplies</h4>
              <div className="text-sm text-gray-600">{supplier.supplies || '—'}</div>
            </div>
            <div>
              <h4 className="font-medium text-emerald-800">Total Paid</h4>
              <div className="text-sm text-emerald-900 font-semibold">${totalPaid.toFixed(2)}</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-emerald-800 mb-2">Record a Purchase</h4>
            <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
              <div className="sm:col-span-2">
                <label className="text-sm text-emerald-700">Product</label>
                <input value={productName} onChange={(e)=>setProductName(e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="text-sm text-emerald-700">Qty</label>
                <input type="number" min={1} value={quantity} onChange={(e)=>setQuantity(Number(e.target.value))} className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="text-sm text-emerald-700">Amount</label>
                <input type="number" step="0.01" min={0} value={amount} onChange={(e)=>setAmount(Number(e.target.value))} className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div className="sm:col-span-4 flex justify-end">
                <button type="submit" className="px-3 py-2 bg-emerald-800 text-white rounded">Add Purchase</button>
              </div>
            </form>
          </div>

          <div>
            <h4 className="font-medium text-emerald-800 mb-2">Recent Purchases</h4>
            <div className="max-h-56 overflow-auto border rounded">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-emerald-700">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {purchases.map((p)=> (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600">{new Date(p.date).toLocaleString()}</td>
                      <td className="px-3 py-2 text-emerald-900">{p.productName}</td>
                      <td className="px-3 py-2">{p.quantity}</td>
                      <td className="px-3 py-2 font-semibold text-emerald-800">${p.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {purchases.length===0 && (
                    <tr><td colSpan={4} className="px-3 py-6 text-center text-sm text-gray-500">No purchases yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-3 border-t flex justify-end">
          <button onClick={onClose} className="px-3 py-2 bg-gray-100 rounded">Close</button>
        </div>
      </div>
    </div>
  );
}
