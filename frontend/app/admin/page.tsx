"use client";

import Link from 'next/link';

export default function AdminIndex() {
  return (
    <div className="max-w-7xl mx-auto py-12">
      <div className="bg-white border rounded-lg p-6 text-center">
        <h1 className="text-2xl font-semibold text-emerald-900">Admin</h1>
        <p className="mt-2 text-gray-600">Go to the admin dashboard</p>
        <div className="mt-4">
          <Link href="/admin/dashboard/overview" className="px-4 py-2 bg-emerald-800 text-white rounded">Open Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
