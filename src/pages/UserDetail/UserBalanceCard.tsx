import React from 'react';
import { Wallet } from 'lucide-react';
import { BalanceChart } from './BalanceChart';

interface UserBalanceCardProps {
  balance: number;
  chartData: { time: string; value: number }[];
}

export const UserBalanceCard: React.FC<UserBalanceCardProps> = ({ balance, chartData }) => {
  return (
    <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel space-y-4 shadow-xl flex flex-col justify-between">
      <div className="border-b border-slate-800 pb-4">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span>Текущий баланс пользователя</span>
        </div>
        <div className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="pt-2">
        <BalanceChart data={chartData} />
      </div>
    </div>
  );
};
