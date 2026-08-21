import React from 'react';
import { Wallet, Loader2 } from 'lucide-react';
import { BalanceChart } from './BalanceChart';

const PERIODS = [
  { label: '1Д', value: '1d' },
  { label: '1Н', value: '1w' },
  { label: '1М', value: '1m' },
  { label: '1Г', value: '1y' },
  { label: 'Все', value: 'all' },
];

interface UserBalanceCardProps {
  balance: number;
  chartData: { time: string; value: number }[];
  period: string;
  onPeriodChange: (period: string) => void;
  isLoading?: boolean;
}

export const UserBalanceCard: React.FC<UserBalanceCardProps> = ({
  balance,
  chartData,
  period,
  onPeriodChange,
  isLoading,
}) => {
  return (
    <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel space-y-4 shadow-xl flex flex-col justify-between">
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Текущий баланс пользователя</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
          {PERIODS.map((p) => {
            const isActive = period === p.value;
            return (
              <button
                key={p.value}
                onClick={() => onPeriodChange(p.value)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2 min-h-[220px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs rounded-xl">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        ) : null}
        <BalanceChart data={chartData} period={period} showDots={false} />
      </div>
    </div>
  );
};

