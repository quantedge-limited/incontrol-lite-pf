"use client";

import { useEffect, useMemo, useState } from 'react';
import SalesChart from './SalesChart';
import SalesFilters from './SalesFilters';
import SalesTable from './SalesTable';
import { Sale, SALES_STORAGE_KEY } from './types';

function monthLabel(d: Date) {
  return d.toLocaleString(undefined, { month: 'short' });
}

function generateSampleSales(): Sale[] {
  const now = new Date();
  const sales: Sale[] = [];
  // generate 8-20 sales per month for last 12 months with varying amounts
  for (let m = 11; m >= 0; m--) {
    const month = new Date(now.getFullYear(), now.getMonth() - m, 15);
    const entries = 6 + Math.floor(Math.random() * 8);
    for (let i = 0; i < entries; i++) {
      const date = new Date(month.getFullYear(), month.getMonth(), 1 + Math.floor(Math.random() * 27), Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      const qty = 1 + Math.floor(Math.random() * 5);
      const price = Math.round((5 + Math.random() * 95) * 100) / 100;
      sales.push({
        id: `s-${date.getTime()}-${i}`,
        date: date.toISOString(),
        productName: ['Hydrating Serum', 'Daily Cleanser', 'Face Mask', 'Sunscreen'][Math.floor(Math.random() * 4)],
        supplier: ['Acme Suppliers', 'Pure Trade', 'Global Goods'][Math.floor(Math.random() * 3)],
        quantity: qty,
        amount: +(qty * price).toFixed(2),
      });
    }
  }
  return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function SalesDashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [month, setMonth] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SALES_STORAGE_KEY);
      if (raw) setSales(JSON.parse(raw));
      else {
        const sample = generateSampleSales();
        setSales(sample);
        localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sample));
      }
    } catch (e) {
      setSales(generateSampleSales());
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
    } catch {}
  }, [sales]);

  // monthly totals for last 12 months (ordered oldest->newest)
  const last12 = useMemo(() => {
    const now = new Date();
    const months: { label: string; year: number; monthIndex: number; value: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ label: `${monthLabel(d)} ${d.getFullYear()}`, year: d.getFullYear(), monthIndex: d.getMonth(), value });
    }

    const totals = months.map((m) => {
      const sum = sales
        .filter((s) => {
          const d = new Date(s.date);
          return d.getFullYear() === m.year && d.getMonth() === m.monthIndex;
        })
        .reduce((a, b) => a + b.amount, 0);
      return sum;
    });

    return { months, totals };
  }, [sales]);

  // apply filters for table
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const d = new Date(s.date);
      if (month) {
        // month is 'YYYY-MM'
        const [y, m] = month.split('-').map(Number);
        if (d.getFullYear() !== y || d.getMonth() + 1 !== m) return false;
      }
      if (query) {
        const ql = query.toLowerCase();
        if (!(`${s.productName} ${s.supplier || ''}`.toLowerCase().includes(ql))) return false;
      }
      return true;
    });
  }, [sales, month, query]);

  function handleDelete(id: string) {
    setSales((s) => s.filter((x) => x.id !== id));
  }

  function addSale(sale: Omit<Sale, 'id'>) {
    const newSale: Sale = { id: `s-${Date.now()}`, ...sale };
    setSales((arr) => [newSale, ...arr]);
  }

  function exportCSV() {
    const headers = ['date', 'product', 'supplier', 'quantity', 'amount'];
    const rows = filteredSales.map((s) => [s.date, s.productName, s.supplier ?? '', String(s.quantity), String(s.amount)]);
    const csv = [headers, ...rows].map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-export-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-emerald-900">Sales</h1>
          <p className="text-sm text-emerald-600">Sales performance and recent transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="px-3 py-2 bg-emerald-800 text-white rounded">Export CSV</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-gray-500">Revenue (12m)</div>
                  <div className="text-2xl font-semibold text-emerald-900">${last12.totals.reduce((a,b)=>a+b,0).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Orders (12m)</div>
                  <div className="text-2xl font-semibold text-emerald-900">{sales.length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Avg Order</div>
                  <div className="text-2xl font-semibold text-emerald-900">${(sales.reduce((a,b)=>a+b.amount,0)/Math.max(1,sales.length)).toFixed(2)}</div>
                </div>
              </div>
              <div>
                <SalesFilters month={month} months={last12.months.map(m=>({label:m.label,value:m.value}))} onMonth={setMonth} />
              </div>
            </div>

            <div className="mt-2">
              <SalesChart months={last12.months.map(m=>m.label)} totals={last12.totals} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3 border rounded">
              <h4 className="text-sm font-medium text-emerald-800 mb-2">Record Sale</h4>
              <RecordSaleForm onSave={(s)=>addSale(s)} />
            </div>

            <div className="p-3 border rounded">
              <h4 className="text-sm font-medium text-emerald-800 mb-1">Insights</h4>
              <div className="text-sm text-gray-600">Top product: <span className="font-medium text-emerald-900">{topProduct(sales)}</span></div>
              <div className="text-sm text-gray-600 mt-1">Last month revenue: <span className="font-medium text-emerald-900">${lastMonthRevenue(sales).toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        <div>
          <SalesTable sales={filteredSales} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}

function lastMonthRevenue(sales: Sale[]) {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth()-1, 1);
  const y = last.getFullYear();
  const m = last.getMonth();
  return sales.filter(s=>{ const d=new Date(s.date); return d.getFullYear()===y && d.getMonth()===m }).reduce((a,b)=>a+b.amount,0);
}

function topProduct(sales: Sale[]) {
  const map: Record<string, number> = {};
  sales.forEach(s=> map[s.productName] = (map[s.productName]||0) + s.amount);
  const entries = Object.entries(map);
  if (entries.length===0) return '—';
  entries.sort((a,b)=>b[1]-a[1]);
  return entries[0][0];
}

function RecordSaleForm({onSave}:{onSave:(s:Omit<Sale,'id'>)=>void}){
  const [date, setDate] = useState(new Date().toISOString().slice(0,16));
  const [productName, setProductName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(0);

  function submit(e:React.FormEvent){
    e.preventDefault();
    onSave({ date: new Date(date).toISOString(), productName, supplier: supplier||undefined, quantity, amount });
    setProductName(''); setSupplier(''); setQuantity(1); setAmount(0); setDate(new Date().toISOString().slice(0,16));
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-2">
      <input type="datetime-local" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full border rounded px-2 py-1" />
      <input required placeholder="Product name" value={productName} onChange={(e)=>setProductName(e.target.value)} className="w-full border rounded px-2 py-1" />
      <input placeholder="Supplier" value={supplier} onChange={(e)=>setSupplier(e.target.value)} className="w-full border rounded px-2 py-1" />
      <div className="grid grid-cols-2 gap-2">
        <input type="number" min={1} value={quantity} onChange={(e)=>setQuantity(Number(e.target.value))} className="w-full border rounded px-2 py-1" />
        <input type="number" step="0.01" min={0} value={amount} onChange={(e)=>setAmount(Number(e.target.value))} className="w-full border rounded px-2 py-1" />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="px-3 py-2 bg-emerald-800 text-white rounded">Save</button>
      </div>
    </form>
  );
}
