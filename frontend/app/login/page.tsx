"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const redirect = searchParams.get('redirect') || '';
    // Redirect to admin login with the same redirect parameter
    router.replace(`/admin/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`);
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to admin login...</p>
      </div>
    </div>
  );
}