"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingUp,
  Package,
  Download,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
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

const BRANDS = [
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

function monthLabel(d: Date): string {
  return d.toLocaleString(undefined, { month: "short" });
}

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

  const chartData = useMemo(() => {
    const now = new Date();
    const months: MonthData[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        label: monthLabel(d),
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
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
        .reduce((a, b) => a + b.amount, 0),
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
        .reduce((a, b) => a + b.amount, 0),
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

  const walkInSales = filteredSales
    .filter((s) => s.type === "Walk-in")
    .slice(0, 10);
  const totalRevenue = filteredSales.reduce((a, b) => a + b.amount, 0);

  function addSale(sale: Omit<SaleWithType, "id">) {
    const newSale: SaleWithType = { id: `s-${Date.now()}`, ...sale };
    setSales((arr) => [newSale, ...arr]);
    setMonth(null);
  }

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Type",
      "Brand",
      "Customer Phone",
      "Qty",
      "Total (KES)",
    ];
    const rows = filteredSales.map((s) => {
      const d = new Date(s.date);
      const dateStr = d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
      });
      return [
        dateStr,
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
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `mams_ledger_${month || "all_time"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0fdf4" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Sales Ledger
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Track real-time KES revenue and brand performance
            </p>
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
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-5 sm:p-6 shadow-md "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Gross Revenue
                </p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
                  KES {totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-5 sm:p-6 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Leading Brand
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-700 mt-1">
                  {topProduct(sales)}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-5 sm:p-6 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Total Sales
                </p>
                <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-1">
                  {filteredSales.length}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Column - Moved to top on mobile for better UX */}
          <div className="lg:col-span-4 lg:order-2">
            <div className="lg:sticky lg:top-8 bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <Plus size={20} />
                </div>
                <h4 className="text-lg font-bold text-gray-900">
                  Record New Sale
                </h4>
              </div>
              <RecordSaleForm onSave={addSale} />
            </div>
          </div>

          {/* Charts and Tables Column */}
          <div className="lg:col-span-8 lg:order-1 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">
                  Online Revenue
                </h3>
                <div className="h-56 sm:h-64">
                  <SalesChart
                    months={chartData.months}
                    totals={chartData.onlineTotals}
                  />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4">
                  Walk-in Revenue
                </h3>
                <div className="h-56 sm:h-64">
                  <SalesChart
                    months={chartData.months}
                    totals={chartData.walkInTotals}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-2xl overflow-hidden">
              <div className="px-6 py-5 flex justify-between items-center">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Recent Walk-ins
                  </h2>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold">
                    Latest 10 Transactions
                  </p>
                </div>
                <button
                  onClick={() => setShowWalkInTable(!showWalkInTable)}
                  className="lg:hidden p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                >
                  {showWalkInTable ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
              <div
                className={`${showWalkInTable ? "block" : "hidden"} lg:block overflow-x-auto`}
              >
                <SalesTable sales={walkInSales} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordSaleForm({
  onSave,
}: {
  onSave: (s: Omit<SaleWithType, "id">) => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [brand, setBrand] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [amount, setAmount] = useState(0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      date: new Date(date).toISOString(),
      productName: `${brand} - ${itemDescription}`,
      supplier: phone || undefined,
      quantity: Number(quantity),
      amount: Number(amount),
      type: "Walk-in",
    });
    setBrand("");
    setItemDescription("");
    setPhone("");
    setQuantity(0);
    setAmount(0);
    setDate(new Date().toISOString().slice(0, 16));
  }

  const inputStyles =
    "w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none";
  const labelStyles =
    "text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className={labelStyles}>Date & Time</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputStyles}
        />
      </div>
      <div>
        <label className={labelStyles}>Select Brand</label>
        <div className="relative">
          <select
            required
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className={`${inputStyles} cursor-pointer`}
          >
            <option value="">Select Brand...</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
      <div>
        <label className={labelStyles}>Item Description</label>
        <input
          required
          placeholder="Size/Type (e.g. 1kg Power)"
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
          className={inputStyles}
        />
      </div>
      <div>
        <label className={labelStyles}>Customer Phone</label>
        <input
          placeholder="07..."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputStyles}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelStyles}>Qty</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className={inputStyles}
          />
        </div>
        <div>
          <label className={labelStyles}>Total KES</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className={inputStyles}
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all mt-4 flex items-center justify-center gap-2"
      >
        Log Transaction
      </button>
    </form>
  );
}

function topProduct(sales: SaleWithType[]): string {
  const map: Record<string, number> = {};
  sales.forEach((s) => {
    const brandOnly = s.productName.split(" - ")[0];
    map[brandOnly] = (map[brandOnly] || 0) + s.amount;
  });
  const entries = Object.entries(map);
  if (entries.length === 0) return "—";
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}
