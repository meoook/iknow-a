import React, { useState, useId, useMemo } from 'react';

export interface LineAreaChartPoint {
  time: string;
  value: number;
}

export interface LineAreaChartProps {
  data: LineAreaChartPoint[];
  height?: number;
  showDots?: boolean;
  colorScheme?: 'emerald' | 'cyan' | 'purple' | 'amber';
  valuePrefix?: string;
  valueSuffix?: string;
  period?: '1d' | '1w' | '1m' | '1y' | 'all' | string;
  formatValue?: (val: number) => string;
  formatTimeLabel?: (time: string) => string;
  emptyText?: string;
  className?: string;
}

const COLOR_CONFIGS = {
  emerald: {
    stroke: '#10b981',
    strokeGradient: ['#34d399', '#10b981', '#059669'],
    fillColor: '#10b981',
    fillOpacity: [0.35, 0.08, 0.0],
    hoverDot: '#34d399',
    hoverGlow: 'rgba(52, 211, 153, 0.25)',
    guideLine: '#10b981',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-300',
  },
  cyan: {
    stroke: '#06b6d4',
    strokeGradient: ['#06b6d4', '#22d3ee', '#10b981'],
    fillColor: '#06b6d4',
    fillOpacity: [0.45, 0.1, 0.0],
    hoverDot: '#22d3ee',
    hoverGlow: 'rgba(34, 211, 238, 0.25)',
    guideLine: '#38bdf8',
    badgeBorder: 'border-cyan-500/40',
    badgeText: 'text-cyan-300',
  },
  purple: {
    stroke: '#a855f7',
    strokeGradient: ['#c084fc', '#a855f7', '#9333ea'],
    fillColor: '#a855f7',
    fillOpacity: [0.4, 0.1, 0.0],
    hoverDot: '#c084fc',
    hoverGlow: 'rgba(192, 132, 252, 0.25)',
    guideLine: '#c084fc',
    badgeBorder: 'border-purple-500/40',
    badgeText: 'text-purple-300',
  },
  amber: {
    stroke: '#f59e0b',
    strokeGradient: ['#fbbf24', '#f59e0b', '#d97706'],
    fillColor: '#f59e0b',
    fillOpacity: [0.4, 0.1, 0.0],
    hoverDot: '#fbbf24',
    hoverGlow: 'rgba(251, 191, 36, 0.25)',
    guideLine: '#fbbf24',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-300',
  },
};

export const LineAreaChart: React.FC<LineAreaChartProps> = ({
  data = [],
  height = 180,
  showDots = false,
  colorScheme = 'emerald',
  valuePrefix = '$',
  valueSuffix = '',
  period,
  formatValue,
  formatTimeLabel,
  emptyText = 'Нет данных за выбранный период',
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const rawId = useId();
  const chartId = useMemo(() => rawId.replace(/[^a-zA-Z0-9_-]/g, '_'), [rawId]);
  const colors = COLOR_CONFIGS[colorScheme] || COLOR_CONFIGS.emerald;

  // Normalize points (ensure at least 2 points for line drawing)
  const normalizedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (data.length === 1) {
      return [
        { time: data[0].time, value: data[0].value },
        { time: data[0].time, value: data[0].value },
      ];
    }
    return data;
  }, [data]);

  // Up to 5 distributed labels
  const labelIndices = useMemo(() => {
    const n = normalizedData.length;
    if (n === 0) return [];
    if (n <= 1) return [0];
    if (n <= 5) return Array.from({ length: n }, (_, i) => i);
    return [
      0,
      Math.round((n - 1) * 0.25),
      Math.round((n - 1) * 0.5),
      Math.round((n - 1) * 0.75),
      n - 1,
    ];
  }, [normalizedData]);

  const defaultFormatValue = (val: number) => {
    if (formatValue) return formatValue(val);
    return `${valuePrefix}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${valueSuffix}`;
  };

  const defaultFormatTimeLabel = (timeStr: string) => {
    if (formatTimeLabel) return formatTimeLabel(timeStr);
    if (!timeStr) return '';

    const parts = timeStr.includes('T') ? timeStr.split('T') : timeStr.split(' ');

    // Only perform date/time splitting if it is actually a timestamp with a time component (contains ':')
    if (parts.length > 1 && parts[1].includes(':')) {
      if (period === '1d') {
        // 1D: show only time HH:MM
        return parts[1].slice(0, 5);
      }
      // Other periods: show only date YYYY-MM-DD
      return parts[0];
    }

    return timeStr;
  };


  if (!normalizedData || normalizedData.length === 0) {
    return (
      <div
        style={{ height }}
        className={`w-full flex items-center justify-center rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-xs font-mono ${className}`}
      >
        {emptyText}
      </div>
    );
  }

  // Value bounds
  const values = normalizedData.map((d) => Number(d.value || 0));
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);

  const rangePadding = rawMax === rawMin ? (rawMax === 0 ? 1 : Math.abs(rawMax) * 0.2) : (rawMax - rawMin) * 0.12;
  const minVal = rawMin - rangePadding;
  const maxVal = rawMax + rangePadding;
  const valRange = Math.max(maxVal - minVal, 0.0001);

  // SVG dimensions
  const svgWidth = 500;
  const svgHeight = 120;
  const paddingX = 16;
  const paddingTop = 16;
  const paddingBottom = 16;
  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingTop - paddingBottom;
  const baselineY = svgHeight - paddingBottom;

  const pts = normalizedData.map((item, idx) => {
    const x = paddingX + (idx / Math.max(normalizedData.length - 1, 1)) * usableWidth;
    const norm = (Number(item.value || 0) - minVal) / valRange;
    const y = baselineY - norm * usableHeight;
    return { x, y, data: item };
  });

  // Build smooth Bezier path
  const linePath = pts.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    const prev = arr[idx - 1];
    const cpx1 = prev.x + (pt.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (pt.x - prev.x) / 2;
    const cpy2 = pt.y;
    return `${acc} C ${cpx1.toFixed(1)},${cpy1.toFixed(1)} ${cpx2.toFixed(1)},${cpy2.toFixed(1)} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }, '');

  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)},${baselineY} L ${pts[0].x.toFixed(1)},${baselineY} Z`;


  const totalCount = normalizedData.length;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const mouseX = e.clientX - rect.left;
    const padRatio = paddingX / svgWidth;
    const usableRatio = 1 - 2 * padRatio;
    const currentRatio = (mouseX / rect.width - padRatio) / usableRatio;
    const clampedRatio = Math.max(0, Math.min(1, currentRatio));
    const idx = Math.round(clampedRatio * (normalizedData.length - 1));
    setHoveredIdx(idx);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  return (
    <div className={`w-full select-none font-sans flex flex-col justify-between ${className}`}>
      {/* SVG Canvas Area */}
      <div
        style={{ height: height - 28 }}
        className="w-full relative cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          className="w-full h-full overflow-visible pointer-events-none"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Area Fill Gradient */}
            <linearGradient id={`areaGrad_${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.fillColor} stopOpacity={colors.fillOpacity[0]} />
              <stop offset="60%" stopColor={colors.fillColor} stopOpacity={colors.fillOpacity[1]} />
              <stop offset="100%" stopColor={colors.fillColor} stopOpacity={colors.fillOpacity[2]} />
            </linearGradient>

            {/* Line Stroke Gradient */}
            <linearGradient id={`lineGrad_${chartId}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={colors.strokeGradient[0]} />
              <stop offset="50%" stopColor={colors.strokeGradient[1]} />
              <stop offset="100%" stopColor={colors.strokeGradient[2]} />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={svgWidth - paddingX}
            y2={paddingTop}
            stroke="#334155"
            strokeWidth="0.8"
            strokeDasharray="3 3"
            opacity="0.35"
          />
          <line
            x1={paddingX}
            y1={paddingTop + usableHeight / 2}
            x2={svgWidth - paddingX}
            y2={paddingTop + usableHeight / 2}
            stroke="#334155"
            strokeWidth="0.8"
            strokeDasharray="3 3"
            opacity="0.25"
          />
          <line
            x1={paddingX}
            y1={baselineY}
            x2={svgWidth - paddingX}
            y2={baselineY}
            stroke="#334155"
            strokeWidth="0.8"
            strokeDasharray="3 3"
            opacity="0.2"
          />

          {/* Area & Stroke Path */}
          <path d={areaPath} fill={`url(#areaGrad_${chartId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={`url(#lineGrad_${chartId})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Vertical Guide Line */}
          {hoveredIdx !== null && pts[hoveredIdx] && (
            <line
              x1={pts[hoveredIdx].x}
              y1={paddingTop}
              x2={pts[hoveredIdx].x}
              y2={baselineY}
              stroke={colors.guideLine}
              strokeWidth="1.2"
              strokeDasharray="3 3"
              opacity="0.85"
            />
          )}

          {/* Optional Static Dots */}
          {showDots &&
            pts.map((pt, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 4.5 : totalCount > 20 ? 2 : 3}
                  fill={isHovered ? colors.hoverDot : colors.stroke}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />
              );
            })}

          {/* Active Hover Glow Dot (Always displayed on hover even if showDots=false) */}
          {hoveredIdx !== null && pts[hoveredIdx] && (
            <g>
              <circle
                cx={pts[hoveredIdx].x}
                cy={pts[hoveredIdx].y}
                r="8"
                fill={colors.hoverGlow}
              />
              <circle
                cx={pts[hoveredIdx].x}
                cy={pts[hoveredIdx].y}
                r="4.5"
                fill={colors.hoverDot}
                stroke="#0f172a"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay positioned accurately by percent */}
        {hoveredIdx !== null && pts[hoveredIdx] && (
          <div
            style={{ left: `${(pts[hoveredIdx].x / svgWidth) * 100}%` }}
            className={`absolute -top-1.5 -translate-x-1/2 -translate-y-full bg-slate-900/95 border ${colors.badgeBorder} ${colors.badgeText} font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xl pointer-events-none whitespace-nowrap z-20 backdrop-blur-xs flex items-center gap-1.5`}
          >
            <span className="text-slate-400 text-[10px] font-normal">
              {defaultFormatTimeLabel(pts[hoveredIdx].data.time)}
            </span>
            <span>{defaultFormatValue(Number(pts[hoveredIdx].data.value || 0))}</span>
          </div>
        )}
      </div>

      {/* X-Axis Timeline Labels */}
      <div className="relative w-full h-5 pt-1 border-t border-slate-800/60 select-none">
        {labelIndices.map((dataIdx, i) => {
          const pt = pts[dataIdx];
          if (!pt) return null;
          const isFirst = i === 0;
          const isLast = i === labelIndices.length - 1;
          const leftPercent = (pt.x / svgWidth) * 100;
          const labelText = defaultFormatTimeLabel(pt.data.time);

          return (
            <div
              key={dataIdx}
              style={{
                left: `${leftPercent}%`,
                transform: isFirst ? 'translateX(0%)' : isLast ? 'translateX(-100%)' : 'translateX(-50%)',
              }}
              className="absolute top-1 cursor-default pointer-events-none"
            >
              <span
                className={`text-[10px] font-mono whitespace-nowrap transition-colors block ${
                  hoveredIdx === dataIdx
                    ? `font-bold ${colors.badgeText}`
                    : isLast
                    ? 'text-slate-300 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                {labelText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

