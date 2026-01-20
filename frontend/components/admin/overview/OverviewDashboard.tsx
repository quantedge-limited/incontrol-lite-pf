"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SalesChart from '../sales/SalesChart';
import { Sale, SALES_STORAGE_KEY } from '../sales/types';
import { Product, STORAGE_KEY } from '../inventory/types';

export default function OverviewDashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SALES_STORAGE_KEY);
      if (raw) setSales(JSON.parse(raw));
    } catch {}
    try {
      const raw2 = localStorage.getItem(STORAGE_KEY);
      if (raw2) setProducts(JSON.parse(raw2));
    } catch {}
  }, []);

  const kpis = useMemo(() => {
    const revenue = sales.reduce((a, b) => a + b.amount, 0);

    let cost = 0;
    sales.forEach((s) => {
      const prod = s.productId ? products.find((p) => p.id === s.productId) : products.find((p) => p.name === s.productName);
      if (prod) cost += (prod.price || 0) * s.quantity;
      else cost += s.amount * 0.7; // fallback assumption: 70% of sale amount is cost
    });

    const profit = revenue - cost;

    const now = new Date();
    const mtd = sales.filter((s) => {
      const d = new Date(s.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).reduce((a, b) => a + b.amount, 0);

    // last month vs previous month
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const lastMonthRevenue = sales.filter((s) => { const d = new Date(s.date); return d.getFullYear() === lastMonthDate.getFullYear() && d.getMonth() === lastMonthDate.getMonth(); }).reduce((a,b)=>a+b.amount,0);
    const prevMonthRevenue = sales.filter((s) => { const d = new Date(s.date); return d.getFullYear() === prevMonthDate.getFullYear() && d.getMonth() === prevMonthDate.getMonth(); }).reduce((a,b)=>a+b.amount,0);
    const monthChange = prevMonthRevenue === 0 ? 0 : ((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;

    return { revenue, cost, profit, mtd, lastMonthRevenue, prevMonthRevenue, monthChange };
  }, [sales, products]);

  const last6 = useMemo(() => {
    const now = new Date();
    const months: string[] = [];
    const totals: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.toLocaleString(undefined, { month: 'short' })} ${d.getFullYear()}`);
      const sum = sales.filter((s) => { const sd = new Date(s.date); return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth(); }).reduce((a,b)=>a+b.amount,0);
      totals.push(sum);
    }
    return { months, totals };
  }, [sales]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-emerald-900">Admin Overview</h1>
          <p className="text-sm text-emerald-600">Quick links, KPIs and recent trends.</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-white border rounded shadow">
          <div className="text-xs text-gray-500">Revenue (12m)</div>
          <div className="text-2xl font-semibold text-emerald-900">${kpis.revenue.toFixed(2)}</div>
          <div className="text-sm text-gray-600 mt-1">MTD: ${kpis.mtd.toFixed(2)}</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-white border rounded shadow">
          <div className="text-xs text-gray-500">Cost (estimated)</div>
          <div className="text-2xl font-semibold text-emerald-900">${kpis.cost.toFixed(2)}</div>
          <div className={`text-sm mt-1 ${kpis.profit < 0 ? 'text-red-600' : 'text-gray-600'}`}>Profit: ${kpis.profit.toFixed(2)}</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-white border rounded shadow md:col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Performance (last 6 months)</div>
              <div className={`text-lg font-semibold ${kpis.monthChange < 0 ? 'text-red-600' : 'text-emerald-900'}`}>{kpis.monthChange.toFixed(1)}% vs previous month</div>
            </div>
          </div>
          <div className="mt-3">
            <SalesChart months={last6.months} totals={last6.totals} />
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/dashboard/sales" className="block p-4 bg-white border rounded shadow hover:shadow-md">
          <div className="text-sm font-medium text-emerald-700">Sales</div>
          <div className="mt-2 text-lg font-semibold text-emerald-900">View performance</div>
        </Link>

        <Link href="/admin/dashboard/inventory" className="block p-4 bg-white border rounded shadow hover:shadow-md">
          <div className="text-sm font-medium text-emerald-700">Inventory</div>
          <div className="mt-2 text-lg font-semibold text-emerald-900">Manage stock</div>
        </Link>

        <Link href="/admin/dashboard/suppliers" className="block p-4 bg-white border rounded shadow hover:shadow-md">
          <div className="text-sm font-medium text-emerald-700">Suppliers</div>
          <div className="mt-2 text-lg font-semibold text-emerald-900">Supplier records</div>
        </Link>

        <Link href="/admin/dashboard/clients" className="block p-4 bg-white border rounded shadow hover:shadow-md">
          <div className="text-sm font-medium text-emerald-700">Clients</div>
          <div className="mt-2 text-lg font-semibold text-emerald-900">Client management</div>
        </Link>
      </div>
    </div>
  );
}
