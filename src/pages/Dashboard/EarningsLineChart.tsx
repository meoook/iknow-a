import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

interface EarningsHistoryItem {
  date: string;
  amount: number;
}

interface EarningsLineChartProps {
  history: EarningsHistoryItem[];
}

export const EarningsLineChart: React.FC<EarningsLineChartProps> = ({ history }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxAmount = Math.max(...history.map((d) => d.amount), 1);

  return (
    <div className="pt-4 font-sans">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar size={13} className="text-cyan-400" />
          <span>Динамика комиссии за последние 7 дней</span>
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          {hoveredIdx !== null ? (
            <span className="text-cyan-300 font-bold">
              {history[hoveredIdx].date}: ${history[hoveredIdx].amount.toFixed(2)}
            </span>
          ) : (
            'Наведите на точку графика для деталей'
          )}
        </span>
      </div>

      {/* Smooth SVG Line Chart */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 relative">
        <div className="w-full h-36 relative">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 500 120"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Gradient for area fill under the line */}
              <linearGradient id="dashboardFeeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>

              {/* Gradient for the line stroke */}
              <linearGradient id="dashboardFeeLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Horizontal subtle grid lines */}
            <line x1="20" y1="20" x2="480" y2="20" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
            <line x1="20" y1="55" x2="480" y2="55" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
            <line x1="20" y1="90" x2="480" y2="90" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.2" />

            {/* Area & Line */}
            {(() => {
              const pts = history.map((item, idx) => {
                const x = 30 + (idx / (history.length - 1)) * 440;
                const y = 95 - (item.amount / maxAmount) * 75;
                return { x, y };
              });

              const linePath = pts.reduce((acc, pt, idx, arr) => {
                if (idx === 0) return `M ${pt.x},${pt.y}`;
                const prev = arr[idx - 1];
                const cpx1 = prev.x + (pt.x - prev.x) / 2;
                const cpy1 = prev.y;
                const cpx2 = prev.x + (pt.x - prev.x) / 2;
                const cpy2 = pt.y;
                return `${acc} C ${cpx1},${cpy1} ${cpx2},${cpy2} ${pt.x},${pt.y}`;
              }, '');

              const areaPath = `${linePath} L ${pts[pts.length - 1].x},100 L ${pts[0].x},100 Z`;

              return (
                <>
                  <path d={areaPath} fill="url(#dashboardFeeAreaGradient)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="url(#dashboardFeeLineGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Hover Vertical Guide Line */}
                  {hoveredIdx !== null && (
                    <line
                      x1={pts[hoveredIdx].x}
                      y1={15}
                      x2={pts[hoveredIdx].x}
                      y2={100}
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      opacity="0.8"
                    />
                  )}

                  {/* Dots on line */}
                  {pts.map((pt, idx) => {
                    const isHovered = hoveredIdx === idx;
                    const isToday = idx === pts.length - 1;

                    return (
                      <g key={idx} className="cursor-pointer">
                        {isHovered && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="8"
                            fill="#22d3ee"
                            fillOpacity="0.25"
                          />
                        )}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 5 : 3.5}
                          fill={isToday ? '#10b981' : isHovered ? '#22d3ee' : '#06b6d4'}
                          stroke="#0f172a"
                          strokeWidth="2"
                          className="transition-all duration-200"
                        />
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </svg>

          {/* Transparent Interactive Overlay Bars for Hover */}
          <div className="absolute inset-0 flex items-stretch">
            {history.map((item, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 cursor-pointer relative"
              >
                {hoveredIdx === idx && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-10">
                    ${item.amount.toFixed(2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* X-Axis Dates Labels */}
        <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-800/60 mt-1">
          {history.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            const isToday = idx === history.length - 1;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="text-center cursor-pointer"
              >
                <span
                  className={`text-[11px] font-mono transition-colors block ${
                    isToday
                      ? 'font-bold text-emerald-400'
                      : isHovered
                      ? 'font-bold text-cyan-300'
                      : 'text-slate-400'
                  }`}
                >
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
