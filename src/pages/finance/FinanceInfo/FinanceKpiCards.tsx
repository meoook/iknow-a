import React from 'react';
import { ShieldCheck, TrendingUp } from 'lucide-react';

interface BankInfo {
  bankTotalBalanceUsd: number;
  hotWalletsUsd: number;
  coldWalletsUsd: number;
  reserveRatio: number;
  twentyFourHourVolumeUsd: number;
}

interface FinanceKpiCardsProps {
  bankInfo: BankInfo;
}

export const FinanceKpiCards: React.FC<FinanceKpiCardsProps> = ({ bankInfo }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl glass-panel relative">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Общий баланс банка (USD)
        </span>
        <div className="text-3xl font-extrabold text-emerald-400 font-mono">
          ${bankInfo.bankTotalBalanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Горячие кошельки: ${bankInfo.hotWalletsUsd.toLocaleString()}</span>
          <span>Холодные: ${bankInfo.coldWalletsUsd.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl glass-panel relative">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Коэффициент резервирования
        </span>
        <div className="text-3xl font-extrabold text-cyan-400 font-mono">
          {bankInfo.reserveRatio}%
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-emerald-400 flex items-center gap-1">
          <ShieldCheck size={14} />
          <span>Полное покрытие депозитов пользователей (100% Solvency)</span>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl glass-panel relative">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Суточный оборот (24h Volume)
        </span>
        <div className="text-3xl font-extrabold text-white font-mono">
          ${bankInfo.twentyFourHourVolumeUsd.toLocaleString()}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-1">
          <TrendingUp size={14} className="text-cyan-400" />
          <span>Стабильный поток ликвидности</span>
        </div>
      </div>
    </div>
  );
};
