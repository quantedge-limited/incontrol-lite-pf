"use client";

import React from 'react';

{/*
  This code defines a Filtering Component for your product inventory. 
  It allows users to narrow down a large list of products using three criteria: 
  Text Search, Brand, and Supplier.

In your project, this is likely used on the main inventory dashboard to help staff 
quickly find specific items
  */}

export default function Filters({
  query,
  onQuery,
  brands,
  suppliers,
  brand,
  supplier,
  onBrand,
  onSupplier,
}: {
  query: string;
  onQuery: (s: string) => void;
  brands: string[];
  suppliers: string[];
  brand: string | null;
  supplier: string | null;
  onBrand: (b: string | null) => void;
  onSupplier: (s: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 w-full sm:w-2/3">
        <input
          placeholder="Search products..."
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <select value={brand ?? ''} onChange={(e) => onBrand(e.target.value || null)} className="border rounded px-2 py-2 text-sm">
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select value={supplier ?? ''} onChange={(e) => onSupplier(e.target.value || null)} className="border rounded px-2 py-2 text-sm">
          <option value="">All suppliers</option>
          {suppliers.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
