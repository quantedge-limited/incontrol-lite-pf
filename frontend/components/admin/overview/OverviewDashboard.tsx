// components/admin/overview/OverviewDashboard.tsx - COMPLETE VERSION
"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SalesChart from '../sales/SalesChart';
import { salesApi } from '@/lib/api/salesApi';
import { inventoryApi } from '@/lib/api/inventoryApi';

{/*
  
  This component renders the main overview dashboard for the admin panel. It fetches sales and inventory data,
  calculates key performance indicators (KPIs), and displays them in a user-friendly format with charts and links
  to detailed sections. It includes error handling and loading states for better UX. */}

// Define a local interface for fallback stats
interface LocalSalesStats {
  total_revenue: number;
  recent_revenue: number;
  total_sales: number;
  recent_sales: number;
  avg_order_value: number;
  monthly_trend: number[];
  total_profit: number;
  recent_profit: number;
  top_products: Array<{
    name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
  low_stock_items: number;
  out_of_stock_items: number;
}

export default function OverviewDashboard() {
  const [salesStats, setSalesStats] = useState<LocalSalesStats | null>(null);
  const [chartData, setChartData] = useState<{months: string[], totals: number[]}>({months: [], totals: []});
  const [inventoryCount, setInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch only available data
      const inventory = await inventoryApi.list().catch(() => []);
      setInventoryCount(inventory.length);
      
      // Try to load from localStorage for demo
      const raw = localStorage.getItem('sales_data');
      if (raw) {
        const data = JSON.parse(raw);
        const stats: LocalSalesStats = {
          total_revenue: data.revenue || 0,
          recent_revenue: data.mtd || 0,
          total_sales: data.totalSales || 0,
          recent_sales: data.recentSales || 0,
          avg_order_value: data.avgOrderValue || 0,
          monthly_trend: data.monthlyTrend || [],
          total_profit: data.profit || 0,
          recent_profit: data.recentProfit || 0,
          top_products: data.topProducts || [],
          low_stock_items: data.lowStockItems || 0,
          out_of_stock_items: data.outOfStockItems || 0,
        };
        setSalesStats(stats);
        
        const last6 = data.last6months || { months: [], totals: [] };
        setChartData(last6);
      } else {
        // Set default/empty stats
        const defaultStats: LocalSalesStats = {
          total_revenue: 0,
          recent_revenue: 0,
          total_sales: 0,
          recent_sales: 0,
          avg_order_value: 0,
          monthly_trend: [],
          total_profit: 0,
          recent_profit: 0,
          top_products: [],
          low_stock_items: 0,
          out_of_stock_items: 0,
        };
        setSalesStats(defaultStats);
        setChartData({ months: [], totals: [] });
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data');
      
      // Set fallback empty data
      const fallbackStats: LocalSalesStats = {
        total_revenue: 0,
        recent_revenue: 0,
        total_sales: 0,
        recent_sales: 0,
        avg_order_value: 0,
        monthly_trend: [],
        total_profit: 0,
        recent_profit: 0,
        top_products: [],
        low_stock_items: 0,
        out_of_stock_items: 0,
      };
      setSalesStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  };

  const kpis = useMemo(() => {
    if (!salesStats) {
      return {
        revenue: 0,
        cost: 0,
        profit: 0,
        mtd: 0,
        monthChange: 0
      };
    }

    const revenue = salesStats.total_revenue;
    const cost = salesStats.total_revenue - salesStats.total_profit;
    const profit = salesStats.total_profit;
    const mtd = salesStats.recent_revenue;

    // Calculate month-over-month change
    const monthChange = salesStats.monthly_trend.length >= 2 
      ? ((salesStats.monthly_trend[salesStats.monthly_trend.length - 1] - 
          salesStats.monthly_trend[salesStats.monthly_trend.length - 2]) / 
          salesStats.monthly_trend[salesStats.monthly_trend.length - 2]) * 100 
      : 0;

    return { revenue, cost, profit, mtd, monthChange };
  }, [salesStats]);

  const last6 = useMemo(() => {
    return {
      months: chartData.months.length > 0 
        ? chartData.months.slice(-6) 
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      totals: chartData.totals.length > 0 
        ? chartData.totals.slice(-6) 
        : [0, 0, 0, 0, 0, 0]
    };
  }, [chartData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-emerald-900">Admin Overview</h1>
            <p className="text-sm text-emerald-600">Quick links, KPIs and recent trends.</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-emerald-900">Admin Overview</h1>
          <p className="text-sm text-emerald-600">Quick links, KPIs and recent trends.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-white border rounded shadow">
          <div className="text-xs text-gray-500">Revenue (12m)</div>
          <div className="text-2xl font-semibold text-emerald-900">
            ${kpis.revenue.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            MTD: ${kpis.mtd.toFixed(2)}
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-white border rounded shadow">
          <div className="text-xs text-gray-500">Cost (estimated)</div>
          <div className="text-2xl font-semibold text-emerald-900">
            ${kpis.cost.toFixed(2)}
          </div>
          <div className={`text-sm mt-1 ${kpis.profit < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            Profit: ${kpis.profit.toFixed(2)}
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-white border rounded shadow md:col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Performance (last 6 months)</div>
              <div className={`text-lg font-semibold ${kpis.monthChange < 0 ? 'text-red-600' : 'text-emerald-900'}`}>
                {kpis.monthChange.toFixed(1)}% vs previous month
              </div>
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
          <div className="mt-2 text-lg font-semibold text-emerald-900">
            {salesStats ? `${salesStats.recent_sales} recent` : 'View performance'}
          </div>
        </Link>

        <Link href="/admin/dashboard/inventory" className="block p-4 bg-white border rounded shadow hover:shadow-md">
          <div className="text-sm font-medium text-emerald-700">Inventory</div>
          <div className="mt-2 text-lg font-semibold text-emerald-900">
            {inventoryCount} items
          </div>
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

      {/* Additional Stats */}
      {salesStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-white border rounded shadow">
            <div className="text-xs text-gray-500">Average Order Value</div>
            <div className="text-xl font-semibold text-emerald-900">
              ${salesStats.avg_order_value.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Based on {salesStats.total_sales} total sales
            </div>
          </div>

          <div className="p-4 bg-white border rounded shadow">
            <div className="text-xs text-gray-500">Stock Status</div>
            <div className="text-xl font-semibold text-emerald-900">
              {salesStats.low_stock_items} low, {salesStats.out_of_stock_items} out
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Inventory alerts
            </div>
          </div>

          <div className="p-4 bg-white border rounded shadow">
            <div className="text-xs text-gray-500">Recent Activity</div>
            <div className="text-xl font-semibold text-emerald-900">
              {salesStats.recent_sales} sales
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Last 30 days
            </div>
          </div>
        </div>
      )}
    </div>
  );
}