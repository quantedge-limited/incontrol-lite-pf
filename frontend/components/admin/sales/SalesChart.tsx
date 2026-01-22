"use client";

import React from 'react';

// Small lightweight SVG line chart for monthly totals (last 12 months)
export default function SalesChart({
  months,
  totals,
}: {
  months: string[]; // labels
  totals: number[]; // same length
}) {
  const width = 800;
  const height = 220;
  const padding = 32;
  const max = Math.max(...totals, 10);

  const points = totals.map((v, i) => {
    const x = padding + (i / (totals.length - 1)) * (width - padding * 2 || 0);
    const y = height - padding - (v / max) * (height - padding * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(' ');

  return (
    <div className="w-full overflow-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
        {/* grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={padding}
            x2={width - padding}
            y1={padding + t * (height - padding * 2)}
            y2={padding + t * (height - padding * 2)}
            stroke="#e6f4ef"
          />
        ))}

        {/* polyline */}
        <polyline
          fill="none"
          stroke="#065f46"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polyline}
        />

        {/* area behind line */}
        <polygon
          points={`${polyline} ${width - padding},${height - padding} ${padding},${height - padding}`}
          fill="rgba(4, 120, 87, 0.06)"
        />

        {/* points */}
        {points.map((pt, i) => {
          const [x, y] = pt.split(',').map(Number);
          return <circle key={i} cx={x} cy={y} r={3.5} fill="#065f46" />;
        })}

        {/* x labels */}
        {months.map((m, i) => {
          const x = padding + (i / (months.length - 1)) * (width - padding * 2 || 0);
          return (
            <text key={i} x={x} y={height - 6} fontSize={10} fill="#065f46" textAnchor="middle">
              {m}
            </text>
          );
        })}
      </svg>
    </div>
  );
}