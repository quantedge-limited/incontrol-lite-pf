"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');
      const adminEmail = localStorage.getItem('admin_email');
      
      // If no token, redirect to login
      if (!token || !adminEmail) {
        // Don't redirect if we're already on the login page
        if (pathname === '/admin/login') {
          setIsLoading(false);
          return;
        }
        
        console.log('No auth token found, redirecting to login');
        router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      
      // If we have a token and we're on login page, redirect to dashboard
      if (pathname === '/admin/login') {
        console.log('Already logged in, redirecting from login page');
        const redirect = new URLSearchParams(window.location.search).get('redirect') || '/admin/dashboard/sales';
        router.push(redirect);
        return;
      }
      
      // Valid session, show content
      console.log('Valid auth session, showing content');
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children if we're not on login page (which will redirect)
  if (pathname === '/admin/login') {
    return null;
  }

  return <>{children}</>;
}