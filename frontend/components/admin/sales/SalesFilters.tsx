"use client";

import React from 'react';

export default function SalesFilters({
  month,
  months,
  onMonth,
}: {
  month: string | null;
  months: { label: string; value: string }[];
  onMonth: (m: string | null) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm text-emerald-700">Month</label>
        <select 
          value={month ?? 'All'} 
          onChange={(e) => onMonth(e.target.value === 'All' ? null : e.target.value)} 
          className="px-2 py-1 border rounded"
        >
          <option value="All">All (last 12 months)</option>
          {months.map((m) => (
            /* Added suppressHydrationWarning to handle the Sep/Sept mismatch */
            <option 
              key={m.value} 
              value={m.value} 
              suppressHydrationWarning
            >
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}