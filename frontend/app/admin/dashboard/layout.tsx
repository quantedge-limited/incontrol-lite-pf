"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/admin/dashboard/overview' },
    { name: 'Sales', href: '/admin/dashboard/sales' },
    { name: 'Inventory', href: '/admin/dashboard/inventory' },
    { name: 'Suppliers', href: '/admin/dashboard/suppliers' },
    { name: 'Clients', href: '/admin/dashboard/clients' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <motion.aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-emerald-800 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 bg-emerald-900">
          <span className="text-2xl font-bold">Admin</span>
        </div>
        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-emerald-900 text-white' : 'text-emerald-100 hover:bg-emerald-700'}`} onClick={() => setSidebarOpen(false)}>
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 bg-emerald-900">
          <Link href="/" className="flex items-center text-emerald-100 hover:text-white">Logout</Link>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow md:hidden">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none focus:text-gray-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="text-xl font-bold text-emerald-800">Admin</span>
            <div className="w-6" />
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">{children}</main>
      </div>
    </div>
  );
}
