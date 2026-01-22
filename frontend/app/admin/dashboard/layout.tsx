/**
 * AdminDashboardLayout Component
 * * This is a wrapper for all routes under /admin/dashboard/*.
 * It provides:
 * 1. Route protection (client-side auth check).
 * 2. A responsive sidebar navigation.
 * 3. Session management (logout functionality).
 */

// Client-side hooks for routing, path detection, and lifecycle management
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  Truck, 
  Users, 
  LogOut,
  X 
} from 'lucide-react';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // authorized: tracks if the user has a valid local token
  // isSidebarOpen: controls the drawer visibility on mobile devices
  const [authorized, setAuthorized] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  /**
   * SECURITY GUARD:
   * Runs on initial mount. If 'access_token' is missing from localStorage,
   * the user is immediately bounced back to the login page.
   */
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.replace('/admin/login');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthorized(true);
    }
  }, [router]);

  /**
   * LOGOUT HANDLER:
   * Cleans up all auth-related data from the browser storage 
   * and redirects to the login portal.
   */
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('admin_email');
    router.replace('/admin/login');
  };

  // Centralized navigation config for easier maintenance
  const navigation = [
    { name: 'Overview', href: '/admin/dashboard/overview', icon: LayoutDashboard },
    { name: 'Sales', href: '/admin/dashboard/sales', icon: Receipt },
    { name: 'Inventory', href: '/admin/dashboard/inventory', icon: Package },
    { name: 'Suppliers', href: '/admin/dashboard/suppliers', icon: Truck },
    { name: 'Clients', href: '/admin/dashboard/clients', icon: Users },
    { name: 'Products', href: '/admin/dashboard/products', icon: Package },
  ];

  /**
   * AUTH LOADING STATE:
   * Prevents "Flash of Unauthenticated Content" (FOUC). 
   * Shows a loading spinner until the useEffect auth check completes.
   */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* MOBILE OVERLAY: Dimmed background that closes sidebar when clicked */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR: Sticky on desktop, slide-out drawer on mobile */}
      <motion.aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-green-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* LOGO AREA */}
        <div className="flex items-center justify-between h-16 bg-emerald-700 px-4">
          <span className="text-2xl font-bold tracking-tight">Admin</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white">
            <X size={24} />
          </button>
        </div>
        
        {/* NAVIGATION LINKS: Maps through the config and highlights the active route */}
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
                    ? 'bg-white/10 text-emerald-400' 
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`} 
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : 'text-white/80 group-hover:text-white'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER ACTION: Logout trigger */}
        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 text-red-400 hover:text-red-300 transition-colors px-3 py-2"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* MOBILE TOPBAR: Visible only when screen size is small */}
        <header className="bg-white shadow md:hidden">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-xl font-bold text-emerald-600">Admin</span>
            <div className="w-6" />
          </div>
        </header>

        {/* PAGE INJECTION: Where individual dashboard pages (Overview, Sales, etc.) render */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}