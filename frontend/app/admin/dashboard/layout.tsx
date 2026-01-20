"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  Truck, 
  Users, 
  LogOut,
  X // Added close icon
} from 'lucide-react';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/admin/dashboard/overview', icon: LayoutDashboard },
    { name: 'Sales', href: '/admin/dashboard/sales', icon: Receipt },
    { name: 'Inventory', href: '/admin/dashboard/inventory', icon: Package },
    { name: 'Suppliers', href: '/admin/dashboard/suppliers', icon: Truck },
    { name: 'Clients', href: '/admin/dashboard/clients', icon: Users },
    {name: 'Products', href: '/admin/dashboard/products', icon: Package},
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Updated mobile overlay: Transparent background, click to close */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-transparent md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <motion.aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-green-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 bg-emerald-700 px-4">
          <span className="text-2xl font-bold tracking-tight">Admin</span>
          {/* Close icon visible only on mobile */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-5 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400  border-emerald-400' 
                    : 'text-white hover:text-white'
                }`} 
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : 'text-white group-hover:text-white'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 text-red-400 hover:text-red-600 transition-colors px-3 py-2">
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </Link>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow md:hidden">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none focus:text-gray-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-xl font-bold text-emerald-600">Admin</span>
            <div className="w-6" />
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}