"use client";

import { Sale } from "@/lib/api/salesApi";

interface SalesTableProps {
  sales: Sale[];
}

export default function SalesTable({ sales }: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sales records found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {new Date(sale.created_at).toLocaleDateString()}
                </div>
                <div className="text-[10px] text-gray-500">
                  {new Date(sale.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {sale.buyer_name || (sale.client ? sale.client.name : "Guest")}
                </div>
                {sale.buyer_phone && (
                  <div className="text-[10px] text-gray-500">
                    {sale.buyer_phone}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                  sale.sale_type === 'online' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {sale.sale_type.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {sale.items.length} items
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-bold text-emerald-700">
                  KES {sale.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}