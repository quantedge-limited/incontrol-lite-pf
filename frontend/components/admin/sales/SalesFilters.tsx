"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingUp,
  Package,
  Download,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { motion } from "framer-motion";
import SalesChart from "./SalesChart";
import SalesFilters from "./SalesFilters";
import SalesTable from "./SalesTable";
import { salesApi, type Sale, type SalesStats } from "@/lib/api/salesApi";
import { inventoryApi } from "@/lib/api/inventoryApi";
import { toast } from "react-toastify";

interface MonthData {
  label: string;
  year: number;
  monthIndex: number;
  value: string;
}

function monthLabel(d: Date): string {
  return d.toLocaleString(undefined, { month: "short" });
}

export default function SalesDashboard() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [posSales, setPosSales] = useState<any[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch data from Django backend
        const [salesResponse, posResponse] = await Promise.all([
          salesApi.getSales(),
          salesApi.getPOSSales().catch(() => []), // POS sales might be empty
        ]);

        // Extract sales from response (handles paginated or array response)
        const onlineSales = Array.isArray(salesResponse) 
          ? salesResponse 
          : salesResponse?.results || [];
        
        setSales(onlineSales);
        setPosSales(posResponse);
        
        // Calculate stats
        const calculatedStats = calculateStats(onlineSales, posResponse);
        setStats(calculatedStats);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const calculateStats = (onlineSales: Sale[], posSales: any[]): SalesStats => {
    const allSales = [...onlineSales, ...posSales];
    const totalRevenue = allSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
    const totalSales = allSales.length;
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Recent sales (last 30 days)
    const recentSales = allSales.filter(sale => {
      const saleDate = new Date(sale.sale_date || sale.timestamp);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return saleDate > monthAgo;
    });

    return {
      total_revenue: totalRevenue,
      total_sales: totalSales,
      recent_sales: recentSales.length,
      avg_order_value: avgOrderValue,
      top_products: [], // You might need to calculate this separately
      low_stock_items: 0, // You can fetch this from inventory
      out_of_stock_items: 0, // You can fetch this from inventory
    };
  };

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

    // Calculate monthly totals
    const onlineTotals = months.map((m) =>
      sales
        .filter((s) => {
          const d = new Date(s.sale_date);
          return (
            d.getFullYear() === m.year &&
            d.getMonth() === m.monthIndex
          );
        })
        .reduce((a, b) => a + b.total_amount, 0)
    );

    const posTotals = months.map((m) =>
      posSales
        .filter((s) => {
          const d = new Date(s.timestamp);
          return (
            d.getFullYear() === m.year &&
            d.getMonth() === m.monthIndex
          );
        })
        .reduce((a, b) => a + b.total_amount, 0)
    );

    return {
      months: months.map(m => m.label),
      onlineTotals,
      posTotals,
      rawMonths: months,
    };
  }, [sales, posSales]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (month) {
        const d = new Date(s.sale_date);
        const [y, m] = month.split("-").map(Number);
        if (d.getFullYear() !== y || d.getMonth() + 1 !== m) return false;
      }
      return true;
    });
  }, [sales, month]);

  const recentSales = [...filteredSales, ...posSales]
    .sort((a, b) => {
      const dateA = new Date(a.sale_date || a.timestamp);
      const dateB = new Date(b.sale_date || b.timestamp);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 10);

  const totalRevenue = stats?.total_revenue || 
    [...sales, ...posSales].reduce((a, b) => a + (b.total_amount || 0), 0);

  const exportToCSV = () => {
    const headers = ["Date", "Type", "ID", "Customer", "Amount", "Status", "Payment"];
    const rows = [...sales, ...posSales].map((s) => {
      const date = s.sale_date || s.timestamp;
      const d = new Date(date);
      return [
        d.toLocaleDateString(),
        s.timestamp ? 'POS' : 'Online',
        s.transaction_id || s.id,
        s.client_name || 'Guest',
        `KES ${s.total_amount}`,
        s.status || 'completed',
        s.payment_method || 'N/A',
      ];
    });
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading && sales.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
            <p className="text-gray-600">Overview of your sales performance</p>
          </div>
          <div className="flex gap-3">
            <SalesFilters
              month={month}
              months={chartData.rawMonths.map(m => ({
                label: `${m.label} ${m.year}`,
                value: m.value,
              }))}
              onMonth={setMonth}
            />
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.total_sales || 0}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {stats?.avg_order_value?.toFixed(2) || "0.00"}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recent Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.recent_sales || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-4">Online Sales Trend</h3>
            <SalesChart months={chartData.months} totals={chartData.onlineTotals} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-4">POS Sales Trend</h3>
            <SalesChart months={chartData.months} totals={chartData.posTotals} />
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              <button
                onClick={() => setShowTable(!showTable)}
                className="lg:hidden text-emerald-600"
              >
                {showTable ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
          </div>
          <div className={`${showTable ? 'block' : 'hidden lg:block'}`}>
            <SalesTable sales={recentSales} />
          </div>
        </div>
      </div>
    </div>
  );
}