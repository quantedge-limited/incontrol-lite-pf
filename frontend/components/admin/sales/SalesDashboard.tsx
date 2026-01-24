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
  Plus,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { motion } from "framer-motion";
import SalesChart from "./SalesChart";
import SalesFilters from "./SalesFilters";
import SalesTable from "./SalesTable";
import { salesApi, SalesStats } from "@/lib/api/salesApi";
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
  const [sales, setSales] = useState<any[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [showWalkInTable, setShowWalkInTable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch sales, stats, and inventory in parallel
        const [salesData, statsData, inventoryData] = await Promise.all([
          salesApi.list().catch(() => []),
          salesApi.getStats().catch(() => null),
          inventoryApi.list().catch(() => []),
        ]);

        setSales(salesData);
        setStats(statsData);
        setInventoryItems(inventoryData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

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

    // Use stats data if available
    if (stats?.monthly_trend) {
      return {
        months: months.map(m => m.label),
        onlineTotals: stats.monthly_trend,
        walkInTotals: stats.monthly_trend.map(v => v * 0.6), // Adjust based on your data
        rawMonths: months,
      };
    }

    // Fallback to calculating from sales data
    const onlineTotals = months.map((m) =>
      sales
        .filter((s) => {
          const d = new Date(s.created_at);
          return (
            s.sale_type === "online" &&
            d.getFullYear() === m.year &&
            d.getMonth() === m.monthIndex
          );
        })
        .reduce((a, b) => a + b.total_amount, 0)
    );
    const walkInTotals = months.map((m) =>
      sales
        .filter((s) => {
          const d = new Date(s.created_at);
          return (
            s.sale_type === "walkin" &&
            d.getFullYear() === m.year &&
            d.getMonth() === m.monthIndex
          );
        })
        .reduce((a, b) => a + b.total_amount, 0)
    );
    
    return {
      months: months.map((m) => m.label),
      onlineTotals,
      walkInTotals,
      rawMonths: months,
    };
  }, [sales, stats]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (month) {
        const d = new Date(s.created_at);
        const [y, m] = month.split("-").map(Number);
        if (d.getFullYear() !== y || d.getMonth() + 1 !== m) return false;
      }
      return true;
    });
  }, [sales, month]);

  const walkInSales = filteredSales
    .filter((s) => s.sale_type === "walkin")
    .slice(0, 10);
  
  const totalRevenue = stats?.total_revenue || filteredSales.reduce((a, b) => a + b.total_amount, 0);

  async function addSale(saleData: any) {
    try {
      setLoading(true);
      
      // Prepare items for the sale
      const items = saleData.items?.map((item: any) => ({
        inventory: item.inventory,
        quantity: item.quantity,
        price_per_unit: item.price_per_unit,
      })) || [];

      const saleToCreate = {
        buyer_name: saleData.buyer_name || saleData.customerName,
        buyer_phone: saleData.buyer_phone || saleData.phone,
        sale_type: 'walkin' as const,
        total_amount: saleData.total_amount || saleData.amount,
        notes: saleData.notes || '',
        items,
      };

      const createdSale = await salesApi.create(saleToCreate);
      
      // Refresh data
      const [salesData, statsData] = await Promise.all([
        salesApi.list(),
        salesApi.getStats(),
      ]);

      setSales(salesData);
      setStats(statsData);
      setMonth(null);
      
      toast.success('Sale recorded successfully!');
    } catch (error: any) {
      console.error('Failed to create sale:', error);
      toast.error(error.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Type",
      "Customer",
      "Phone",
      "Items",
      "Total (KES)",
    ];
    const rows = filteredSales.map((s) => {
      const d = new Date(s.created_at);
      const dateStr = d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return [
        dateStr,
        s.sale_type,
        s.buyer_name || "Guest",
        s.buyer_phone || "N/A",
        s.items.length,
        s.total_amount.toFixed(2),
      ];
    });
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_${month || "all_time"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && sales.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f0fdf4" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0fdf4" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Sales Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Real-time sales tracking and analytics
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-5 sm:p-6 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Total Revenue
                </p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
                  KES {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                  Total Sales
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-700 mt-1">
                  {stats?.total_sales || sales.length}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
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
                  Avg Order Value
                </p>
                <p className="text-xl sm:text-2xl font-bold text-purple-700 mt-1">
                  KES {stats?.avg_order_value?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-5 sm:p-6 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Low Stock Items
                </p>
                <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-1">
                  {stats?.low_stock_items || 0}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

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
                    Recent Sales
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

function topProduct(sales: any[]): string {
  if (sales.length === 0) return "—";
  
  // Flatten all items from all sales
  const allItems = sales.flatMap(sale => sale.items);
  
  // Count occurrences of each inventory item
  const itemCounts: Record<string, number> = {};
  allItems.forEach(item => {
    const name = item.inventory?.name || 'Unknown';
    itemCounts[name] = (itemCounts[name] || 0) + item.quantity;
  });
  
  // Find the item with the highest count
  const entries = Object.entries(itemCounts);
  if (entries.length === 0) return "—";
  
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}