"use client";

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react'; // Added for the toggle
import SalesChart from './SalesChart';
import SalesFilters from './SalesFilters';
import SalesTable from './SalesTable';
import { Sale, SALES_STORAGE_KEY } from './types';

interface SaleWithType extends Sale {
  type: 'Online' | 'Walk-in';
}

interface MonthData {
  label: string;
  year: number;
  monthIndex: number;
  value: string;
}

function monthLabel(d: Date): string {
  return d.toLocaleString(undefined, { month: 'short' });
}

function generateSampleSales(): SaleWithType[] {
  const now = new Date();
  const sales: SaleWithType[] = [];
  for (let m = 11; m >= 0; m--) {
    const month = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const entries = 6;
    for (let i = 0; i < entries; i++) {
      const date = new Date(month.getFullYear(), month.getMonth(), 1 + i);
      const qty = 1 + Math.floor(Math.random() * 3);
      sales.push({
        id: `s-${date.getTime()}-${i}`,
        date: date.toISOString(),
        productName: ['Fries', 'Fish', 'Beverages', 'Chicken'][Math.floor(Math.random() * 4)],
        supplier: 'Default Supplier',
        quantity: qty,
        amount: qty * (15 + Math.random() * 20),
        type: Math.random() > 0.5 ? 'Online' : 'Walk-in'
      });
    }
  }
  return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function SalesDashboard() {
  const [sales, setSales] = useState<SaleWithType[]>([]);
  const [month, setMonth] = useState<string | null>(null);
  
  // States for mobile toggles
  const [showOnlineTable, setShowOnlineTable] = useState(false);
  const [showWalkInTable, setShowWalkInTable] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SALES_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSales(JSON.parse(raw));
      else {
        const sample = generateSampleSales();
        setSales(sample);
        localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sample));
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setSales(generateSampleSales());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
  }, [sales]);

  const chartData = useMemo(() => {
    const now = new Date();
    const months: MonthData[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ label: monthLabel(d), year: d.getFullYear(), monthIndex: d.getMonth(), value });
    }
    const onlineTotals = months.map(m => 
      sales.filter(s => {
        const d = new Date(s.date);
        return s.type === 'Online' && d.getFullYear() === m.year && d.getMonth() === m.monthIndex;
      }).reduce((a, b) => a + b.amount, 0)
    );
    const walkInTotals = months.map(m => 
      sales.filter(s => {
        const d = new Date(s.date);
        return s.type === 'Walk-in' && d.getFullYear() === m.year && d.getMonth() === m.monthIndex;
      }).reduce((a, b) => a + b.amount, 0)
    );
    return { months: months.map(m => m.label), onlineTotals, walkInTotals, rawMonths: months };
  }, [sales]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (month) {
        const d = new Date(s.date);
        const [y, m] = month.split('-').map(Number);
        if (d.getFullYear() !== y || d.getMonth() + 1 !== m) return false;
      }
      return true;
    });
  }, [sales, month]);

  // Limit to last 10 transactions
  const onlineSales = filteredSales.filter(s => s.type === 'Online').slice(0, 10);
  const walkInSales = filteredSales.filter(s => s.type === 'Walk-in').slice(0, 10);

  function addSale(sale: Omit<SaleWithType, 'id'>) {
    const newSale: SaleWithType = { id: `s-${Date.now()}`, ...sale };
    setSales((arr) => [newSale, ...arr]);
    setMonth(null); 
  }

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Item", "Supplier", "Qty", "Total"];
    const rows = filteredSales.map(s => {
      const d = new Date(s.date);
      // Format as Month Day (e.g., Jan 19)
      const dateStr = d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
      return [dateStr, s.type, s.productName, s.supplier || "N/A", s.quantity, s.amount.toFixed(2)];
    });
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${month || 'all_time'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-8 text-slate-900 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-800">Sales <span className="font-semibold">Ledger</span></h1>
          <p className="text-sm text-slate-500 mt-1">Sales performances and recent transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportToCSV} className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-[11px] font-bold uppercase tracking-widest rounded transition-colors border border-slate-200">
            Export CSV
          </button>
          <SalesFilters month={month} months={chartData.rawMonths.map(m=>({label:`${m.label} ${m.year}`,value:m.value}))} onMonth={setMonth} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* RIGHT COLUMN MOVED TO TOP ON MOBILE (order-1 on small, order-2 on large) */}
        <div className="lg:col-span-4 space-y-8 order-1 lg:order-2">
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-5">Record Sale</h4>
            <RecordSaleForm onSave={addSale} />
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Quick Analysis</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-slate-100 pb-3">
                <span className="text-xs text-slate-500">Leading Category</span>
                <span className="text-sm font-medium">{topProduct(sales)}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs text-slate-500">Gross Total</span>
                <span className="text-sm font-semibold">${filteredSales.reduce((a,b)=>a+b.amount,0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN (order-2 on small, order-1 on large) */}
        <div className="lg:col-span-8 space-y-8 order-2 lg:order-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-4">Online Revenue</h3>
              <div className="h-50">
                <SalesChart months={chartData.months} totals={chartData.onlineTotals} />
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-4">Walk-in Revenue</h3>
              <div className="h-50">
                <SalesChart months={chartData.months} totals={chartData.walkInTotals} />
              </div>
            </div>
          </div>

          {/* ONLINE TRANSACTIONS WITH TOGGLE */}
          <div className="bg-transparent overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Online Transactions (Last 10)</h2>
              <button 
                onClick={() => setShowOnlineTable(!showOnlineTable)}
                className="lg:hidden flex items-center gap-1 text-xs font-bold text-blue-600"
              >
                {showOnlineTable ? <ChevronUp size={16}/> : <ChevronDown size={16}/>} 
                VIEW
              </button>
            </div>
            <div className={`${showOnlineTable ? 'block' : 'hidden'} lg:block`}>
              <SalesTable sales={onlineSales} />
            </div>
          </div>

          {/* WALK-IN TRANSACTIONS WITH TOGGLE */}
          <div className="bg-transparent overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Walk-in Transactions (Last 10)</h2>
              <button 
                onClick={() => setShowWalkInTable(!showWalkInTable)}
                className="lg:hidden flex items-center gap-1 text-xs font-bold text-emerald-600"
              >
                {showWalkInTable ? <ChevronUp size={16}/> : <ChevronDown size={16}/>} 
                VIEW
              </button>
            </div>
            <div className={`${showWalkInTable ? 'block' : 'hidden'} lg:block`}>
              <SalesTable sales={walkInSales} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordSaleForm({onSave}:{onSave:(s:Omit<SaleWithType,'id'>)=>void}){
  const [date, setDate] = useState(new Date().toISOString().slice(0,16));
  const [productName, setProductName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [type, setType] = useState<'Online' | 'Walk-in'>('Online');
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(0);

  function submit(e:React.FormEvent){
    e.preventDefault();
    onSave({ date: new Date(date).toISOString(), productName, supplier: supplier || undefined, quantity, amount, type });
    setProductName(''); setSupplier(''); setQuantity(1); setAmount(0);
    setDate(new Date().toISOString().slice(0,16));
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex p-1 bg-slate-100 rounded-lg">
        <button type="button" onClick={() => setType('Online')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${type === 'Online' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>ONLINE</button>
        <button type="button" onClick={() => setType('Walk-in')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${type === 'Walk-in' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>WALK-IN</button>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-slate-400 uppercase">Transaction Date</label>
        <input type="datetime-local" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-slate-400" />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-slate-400 uppercase">Item Description</label>
        <input required placeholder="e.g. Chicken" value={productName} onChange={(e)=>setProductName(e.target.value)} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-slate-400 uppercase">Supplier</label>
        <input placeholder="Source..." value={supplier} onChange={(e)=>setSupplier(e.target.value)} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase">Qty</label>
          <input type="number" min={1} value={quantity} onChange={(e)=>setQuantity(Number(e.target.value))} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase">Total $</label>
          <input type="number" step="0.01" value={amount} onChange={(e)=>setAmount(Number(e.target.value))} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none" />
        </div>
      </div>
      <button type="submit" className={`w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm mt-2 ${type === 'Online' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
        Record {type} Sale
      </button>
    </form>
  );
}

function topProduct(sales: SaleWithType[]): string {
  const map: Record<string, number> = {};
  sales.forEach(s=> map[s.productName] = (map[s.productName]||0) + s.amount);
  const entries = Object.entries(map);
  if (entries.length===0) return '—';
  entries.sort((a,b)=>b[1]-a[1]);
  return entries[0][0];
}