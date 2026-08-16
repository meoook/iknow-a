import React, { useState } from 'react';
import {
  Landmark,
  PiggyBank,
  Users,
  ArrowDownUp,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { IFinanceDashboard } from '../../../types';

interface FinanceKpiCardsProps {
  data: IFinanceDashboard;
}

export const FinanceKpiCards: React.FC<FinanceKpiCardsProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const bankBalance = data.bank_balance;
  const activeBetsAmount = data.active_bets_amount;
  const bankDiff = bankBalance - activeBetsAmount;

  // Check if discrepancy is more than 5% of bank balance
  const diffPercent = bankBalance > 0 ? (Math.abs(bankDiff) / bankBalance) * 100 : 0;
  const isHighDiscrepancy = diffPercent > 5;

  const totalIn = data.txs_total.in_amount;
  const totalOut = data.txs_total.out_amount;
  const totalNet = data.txs_total.net_amount !== undefined
    ? data.txs_total.net_amount
    : totalIn - totalOut;

  const feeToday = data.bank_fee_today || 0;

  // Mock daily earnings data for the chart
  const earningsHistory = [
    { date: '10 авг', amount: 142.5 },
    { date: '11 авг', amount: 215.0 },
    { date: '12 авг', amount: 189.2 },
    { date: '13 авг', amount: 310.8 },
    { date: '14 авг', amount: 275.4 },
    { date: '15 авг', amount: 420.1 },
    { date: 'Сегодня', amount: feeToday > 0 ? feeToday : 365.0 },
  ];

  const maxAmount = Math.max(...earningsHistory.map((d) => d.amount), 1);

  return (
    <div className="space-y-4 font-sans">
      {/* Upper Main Section: 2 Compact Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Bank Balance vs Active Bets (Compact layout) */}
        <div
          className={`bg-slate-900/80 border rounded-2xl p-5 glass-panel relative flex flex-col justify-between shadow-xl transition-all ${isHighDiscrepancy
            ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/5 via-slate-900/90 to-slate-900/80'
            : 'border-slate-800'
            }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Landmark size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Баланс банка и покрытие ставок
                  </h3>
                  <span className="text-xs text-slate-400">
                    Системный баланс за вычетом активных ставок
                  </span>
                </div>
              </div>

              {isHighDiscrepancy ? (
                <div
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl animate-pulse shrink-0"
                  title="Разница между банком и активными ставками превышает 5%"
                >
                  <AlertTriangle size={14} />
                  <span>Отклонение: {diffPercent.toFixed(1)}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl shrink-0">
                  <ShieldCheck size={14} />
                  <span>В пределах 5%</span>
                </div>
              )}
            </div>

            {/* Compact 3-line panel */}
            <div className="pt-3.5">
              <div
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 transition-colors ${isHighDiscrepancy
                  ? 'bg-slate-950/80 border-amber-500/30'
                  : 'bg-slate-950/70 border-slate-800'
                  }`}
              >
                <div className="space-y-2">
                  {/* Line 1: Bank Balance */}
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-300 flex items-center gap-2 font-sans font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span>Баланс банка</span>
                    </span>
                    <span className="font-bold text-emerald-400">
                      ${bankBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Line 2: Minus Active Bets */}
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-300 flex items-center gap-2 font-sans font-bold">
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                      <span>Сумма ставок</span>
                    </span>
                    <span className="font-bold text-blue-400">
                      ${activeBetsAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Line 3: Equals Net Difference */}
                <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between font-mono font-bold">
                  <span className="text-slate-200 font-sans flex items-baseline gap-2">
                    <span>Разница</span>
                    <span className="text-xs text-slate-400 font-normal font-mono">
                      ({diffPercent.toFixed(2)}%)
                    </span>
                  </span>
                  <span
                    className={
                      isHighDiscrepancy
                        ? 'text-amber-400 font-extrabold text-base'
                        : bankDiff >= 0
                          ? 'text-emerald-400 text-base'
                          : 'text-rose-400 text-base'
                    }
                  >
                    ${Math.abs(bankDiff).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: In / Out Combined Block */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 glass-panel relative flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <ArrowDownUp size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Ввод и вывод средств
                  </h3>
                  <span className="text-xs text-slate-400">
                    ExternalTx транзакции депозитов и снятий
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3.5">
              {/* Today */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-1.5">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
                  За сегодня
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-slate-300 font-sans font-medium">Ввод</span>
                    <span className="font-bold text-emerald-400">
                      ${data.txs_today.in_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-slate-300 font-sans font-medium">Вывод</span>
                    <span className="font-bold text-rose-400">
                      ${data.txs_today.out_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-800/70 text-sm text-slate-500 font-mono flex items-center justify-between">
                  <span>{data.txs_today.in_count} ввод.</span>
                  <span>{data.txs_today.out_count} вывод.</span>
                </div>
              </div>

              {/* All Time */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-1.5">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
                  За все время
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-slate-300 font-sans font-medium">Ввод</span>
                    <span className="font-bold text-emerald-400">
                      ${totalIn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-slate-300 font-sans font-medium">Вывод</span>
                    <span className="font-bold text-rose-400">
                      ${totalOut.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-800/70 flex items-center justify-between text-sm font-mono font-bold">
                  <span className="text-slate-200 font-sans">Разница</span>
                  <span className={`${totalNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${Math.abs(totalNet).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section: Featured Earned Fee Card (Left) & 2 Stacked Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Featured "Заработанные средства" with Earnings Chart (lg:col-span-2) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 glass-panel shadow-xl flex flex-col justify-between space-y-4">
          <div>
            {/* Header: Title & Total / Today Metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
                  <PiggyBank size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>Заработанные средства</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Комиссионный доход платформы
                  </span>
                </div>
              </div>

              {/* Balances: All-Time & Today */}
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Всего заработано
                  </div>
                  <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">
                    ${data.bank_fee_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="pl-5 border-l border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    За сегодня
                  </div>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                    <TrendingUp size={16} className="text-emerald-400" />
                    <span>${feeToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings History Chart */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={13} className="text-cyan-400" />
                  <span>Динамика комиссии за последние 7 дней</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {hoveredIdx !== null ? (
                    <span className="text-cyan-300 font-bold">
                      {earningsHistory[hoveredIdx].date}: ${earningsHistory[hoveredIdx].amount.toFixed(2)}
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
                      <linearGradient id="feeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                        <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                      </linearGradient>

                      {/* Gradient for the line stroke */}
                      <linearGradient id="feeLineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="50%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal subtle grid lines */}
                    <line x1="20" y1="20" x2="480" y2="20" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
                    <line x1="20" y1="55" x2="480" y2="55" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
                    <line x1="20" y1="90" x2="480" y2="90" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.2" />

                    {/* Area under the line */}
                    {(() => {
                      const pts = earningsHistory.map((item, idx) => {
                        const x = 30 + (idx / (earningsHistory.length - 1)) * 440;
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
                          <path d={areaPath} fill="url(#feeAreaGradient)" />
                          <path
                            d={linePath}
                            fill="none"
                            stroke="url(#feeLineGradient)"
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
                    {earningsHistory.map((item, idx) => (
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
                  {earningsHistory.map((item, idx) => {
                    const isHovered = hoveredIdx === idx;
                    const isToday = idx === earningsHistory.length - 1;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        className="text-center cursor-pointer"
                      >
                        <span
                          className={`text-[11px] font-mono transition-colors block ${isToday
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
          </div>
        </div>

        {/* Right: 2 Stacked Cards (lg:col-span-1) */}
        <div className="flex flex-col gap-4 justify-between">
          {/* Card 1: Средства пользователей */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel relative flex flex-col justify-between shadow-xl flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Средства пользователей
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Users size={18} />
              </div>
            </div>

            <div className="my-2">
              <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">
                ${data.users_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                Депозиты всех зарегистрированных игроков
              </span>
            </div>

            <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Статус резервов</span>
              <span className="text-emerald-400 font-bold">100% покрытие</span>
            </div>
          </div>

          {/* Card 2: Ставки за сегодня */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel relative flex flex-col justify-between shadow-xl flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Ставки за сегодня
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <TrendingUp size={18} />
              </div>
            </div>

            <div className="my-2">
              <div className="text-2xl font-black text-blue-400 font-mono tracking-tight">
                ${data.bets_today.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                {data.bets_today.total_count} ставок оформлено за сегодня
              </span>
            </div>

            <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Активность игроков</span>
              <span className="text-cyan-400 font-bold">Высокая</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
