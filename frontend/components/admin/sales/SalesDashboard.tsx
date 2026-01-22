"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  Plus,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from 'react-toastify';


import SalesChart from "./SalesChart";
import SalesFilters from "./SalesFilters";
import SalesTable from "./SalesTable";
import { Sale, SALES_STORAGE_KEY } from "./types";

interface SaleWithType extends Sale {
  type: "Online" | "Walk-in";
}

interface MonthData {
  label: string;
  year: number;
  monthIndex: number;
  value: string;
}

const PRODUCTS = [
      "Ariel",
  "Bella",
  "Doffi",
  "Downy",
  "Generic",
  "Hanan",
  "Jamaa",
  "kisskids",
  "Kleesoft",
  "Lissy",
  "Menengai",
  "Molfix",
  "Msafi",
  "Naya",
  "Neptune",
  "Pekee",
  "Planet Aqua",
  "Softcare",
  "Tiara",
  "Toilex",
];

export default function SalesDashboard() {
  const [sales, setSales] = useState<SaleWithType[]>([]);
  const [month, setMonth] = useState<string | null>(null);
  const [showWalkInTable, setShowWalkInTable] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(SALES_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (raw) setSales(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
  }, [sales]);

  // Updated Month Generator: Specifically for 2026
  const chartData = useMemo(() => {
    const targetYear = 2026;
    const months: MonthData[] = [];
    
    // Generate Jan to Dec for 2026
    for (let i = 0; i < 12; i++) {
      const d = new Date(targetYear, i, 1);
      const value = `${targetYear}-${String(i + 1).padStart(2, "0")}`;
      months.push({
        label: d.toLocaleString(undefined, { month: "short" }),
        year: targetYear,
        monthIndex: i,
        value,
      });
    }
    
    const onlineTotals = months.map((m) =>
      sales
        .filter((s) => {
          const d = new Date(s.date);
          return (
            s.type === "Online" &&
            d.getFullYear() === m.year &&
            d.getMonth() === m.monthIndex
          );
        })
        .reduce((a, b) => a + b.amount, 0)
    );
    
    const walkInTotals = months.map((m) =>
      sales
        .filter((s) => {
          const d = new Date(s.date);
          return (
            s.type === "Walk-in" &&
            d.getFullYear() === m.year &&
            d.getMonth() === m.monthIndex
          );
        })
        .reduce((a, b) => a + b.amount, 0)
    );

    return {
      months: months.map((m) => m.label),
      onlineTotals,
      walkInTotals,
      rawMonths: months,
    };
  }, [sales]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (month) {
        const d = new Date(s.date);
        const [y, m] = month.split("-").map(Number);
        if (d.getFullYear() !== y || d.getMonth() + 1 !== m) return false;
      }
      return true;
    });
  }, [sales, month]);

  const walkInSales = filteredSales.filter((s) => s.type === "Walk-in").slice(0, 10);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalRevenue = filteredSales.reduce((a, b) => a + b.amount, 0);

  function addSale(sale: Omit<SaleWithType, "id">) {
    const newSale: SaleWithType = { id: `s-${Date.now()}`, ...sale };
    setSales((arr) => [newSale, ...arr]);
    setMonth(null);
    toast.success("Transaction recorded successfully!");
  }

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Products", "Customer Phone", "Qty", "Total (KES)"];
    const rows = filteredSales.map((s) => {
      const d = new Date(s.date);
      return [
        d.toLocaleString("en-US", { month: "short", day: "numeric" }),
        s.type,
        s.productName,
        s.supplier || "N/A",
        s.quantity,
        s.amount.toFixed(2),
      ];
    });
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `mams_ledger_${month || "2026_all"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info("Exporting CSV...");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0fdf4" }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Sales Ledger 2026</h1>
            <p className="text-sm sm:text-base text-gray-600">Track real-time revenue and product performance</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SalesFilters
              month={month}
              months={chartData.rawMonths.map((m) => ({
                label: `${m.label} ${m.year}`,
                value: m.value,
              }))}
              onMonth={setMonth}
            />
            <button onClick={exportToCSV} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 lg:order-2">
            <div className="lg:sticky lg:top-8 bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Plus size={20} /></div>
                <h4 className="text-lg font-bold text-gray-900">Record New Sale</h4>
              </div>
              <RecordSaleForm onSave={addSale} />
            </div>
          </div>

          <div className="lg:col-span-8 lg:order-1 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">Online Revenue</h3>
                <div className="h-56 sm:h-64">
                  <SalesChart months={chartData.months} totals={chartData.onlineTotals} />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4">Walk-in Revenue</h3>
                <div className="h-56 sm:h-64">
                  <SalesChart months={chartData.months} totals={chartData.walkInTotals} />
                </div>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-2xl overflow-hidden">
              <div className="px-6 py-5 flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Recent Walk-ins</h2>
              </div>
              <div className="overflow-x-auto"><SalesTable sales={walkInSales} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordSaleForm({ onSave }: { onSave: (s: Omit<SaleWithType, "id">) => void }) {
  const [date, setDate] = useState("2026-01-01T12:00");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [itemDescription, setItemDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(0);

  function toggleProduct(p: string) {
    setSelectedProducts(prev => 
      prev.includes(p) ? prev.filter(i => i !== p) : [...prev, p]
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedProducts.length === 0) return toast.error("Please select at least one product");

    // Toast-based Confirmation Logic
    toast.info(
      <div>
        <p className="font-bold mb-2">Confirm Lipa na Mpesa?</p>
        <p className="text-xs mb-2">KES {amount} for {selectedProducts.length} items</p>
        <button 
          onClick={() => {
            onSave({
              date: new Date(date).toISOString(),
              productName: `${selectedProducts.join(", ")} - ${itemDescription}`,
              supplier: phone || undefined,
              quantity: Number(quantity),
              amount: Number(amount),
              type: "Walk-in",
            });
            setSelectedProducts([]);
            setItemDescription("");
            setPhone("");
            setQuantity(1);
            setAmount(0);
            toast.dismiss();
          }}
          className="bg-emerald-600 text-white px-3 py-1 rounded text-xs mr-2"
        >
          Confirm
        </button>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  }

  const inputStyles = "w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all";
  const labelStyles = "text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className={labelStyles}>Date & Time (2026)</label>
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={inputStyles} />
      </div>

      <div className="relative">
        <label className={labelStyles}>Select Products</label>
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`${inputStyles} cursor-pointer flex justify-between items-center min-h-11.5`}
        >
          <span className={selectedProducts.length ? "text-gray-900" : "text-gray-400"}>
            {selectedProducts.length > 0 ? selectedProducts.join(", ") : "Select Products..."}
          </span>
          <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </div>
        
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2"
            >
              {PRODUCTS.map((p) => (
                <div 
                  key={p} 
                  onClick={() => toggleProduct(p)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-emerald-50 rounded-lg cursor-pointer"
                >
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${selectedProducts.includes(p) ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'}`}>
                    {selectedProducts.includes(p) && <Check size={14} className="text-white" />}
                  </div>
                  <span className="text-sm text-gray-700">{p}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <label className={labelStyles}>Item Description</label>
        <input required placeholder="Size/Type (e.g. Medium Portion)" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} className={inputStyles} />
      </div>

      <div>
        <label className={labelStyles}>Customer Phone (M-Pesa)</label>
        <input placeholder="07..." value={phone} onChange={(e) => setPhone(e.target.value)} className={inputStyles} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelStyles}>Qty</label>
          <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className={inputStyles} />
        </div>
        <div>
          <label className={labelStyles}>Total KES</label>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={inputStyles} />
        </div>
      </div>

      <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all mt-4 flex items-center justify-center gap-2">
        Log Transaction
      </button>
    </form>
  );
}