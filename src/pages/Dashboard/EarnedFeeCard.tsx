import React from 'react';
import { PiggyBank, TrendingUp } from 'lucide-react';
import { EarningsLineChart } from './EarningsLineChart';

interface EarnedFeeCardProps {
  bankFeeBalance: number;
  bankFeeToday: number;
}

export const EarnedFeeCard: React.FC<EarnedFeeCardProps> = ({
  bankFeeBalance,
  bankFeeToday,
}) => {
  // Mock daily earnings data for the chart
  const earningsHistory = [
    { date: '10 авг', amount: 142.5 },
    { date: '11 авг', amount: 215.0 },
    { date: '12 авг', amount: 189.2 },
    { date: '13 авг', amount: 310.8 },
    { date: '14 авг', amount: 275.4 },
    { date: '15 авг', amount: 420.1 },
    { date: 'Сегодня', amount: bankFeeToday > 0 ? bankFeeToday : 365.0 },
  ];

  return (
    <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 glass-panel shadow-xl flex flex-col justify-between space-y-4 font-sans">
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
                ${bankFeeBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="pl-5 border-l border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                За сегодня
              </div>
              <div className="text-xl font-black text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                <TrendingUp size={16} className="text-emerald-400" />
                <span>${bankFeeToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings History Chart */}
        <EarningsLineChart history={earningsHistory} />
      </div>
    </div>
  );
};
