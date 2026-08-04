import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Wallet, Send, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useAppSelector } from '../../store';

export const DashboardKpiGrid: React.FC = () => {
  const requests = useAppSelector((state) => state.predictions.requests);
  const activePredictions = useAppSelector((state) => state.predictions.active);
  const bankInfo = useAppSelector((state) => state.finance.bankInfo);
  const withdrawals = useAppSelector((state) => state.finance.withdrawals);

  const totalActiveVolume = activePredictions.reduce((acc, p) => acc + p.volume, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: Bank Balance */}
      <NavLink
        to="/finances/info"
        className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl glass-panel transition-all hover:border-emerald-500/50 hover:bg-slate-800/60 group relative overflow-hidden block"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-200 transition-colors">
            Баланс банка
          </span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white font-mono">
          ${bankInfo.bankTotalBalanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Резерв: {bankInfo.reserveRatio}%</span>
          <ArrowUpRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </NavLink>

      {/* Card 2: Active Predictions Volume */}
      <NavLink
        to="/predictions/active"
        className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl glass-panel transition-all hover:border-cyan-500/50 hover:bg-slate-800/60 group relative overflow-hidden block"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-200 transition-colors">
            Объем предсказаний
          </span>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white font-mono">
          ${totalActiveVolume.toLocaleString('en-US')}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Активных: {activePredictions.length}</span>
          <ArrowUpRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </NavLink>

      {/* Card 3: Pending Requests */}
      <NavLink
        to="/predictions/new"
        className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl glass-panel transition-all hover:border-amber-500/50 hover:bg-slate-800/60 group relative overflow-hidden block"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-200 transition-colors">
            Новые заявки
          </span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 relative group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
            {requests.some((r) => r.hasUnreadWsEvent) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 red-dot-pulse" />
            )}
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white font-mono">
          {requests.length}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Ожидают проверки</span>
          <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </NavLink>

      {/* Card 4: Pending Withdrawals */}
      <NavLink
        to="/finances/withdrawals"
        className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl glass-panel transition-all hover:border-rose-500/50 hover:bg-slate-800/60 group relative overflow-hidden block"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-200 transition-colors">
            Ручной вывод
          </span>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 relative group-hover:scale-110 transition-transform">
            <Send className="w-5 h-5" />
            {withdrawals.some((w) => w.hasUnreadWsEvent) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 red-dot-pulse" />
            )}
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white font-mono">
          {withdrawals.length}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Запросов в очереди</span>
          <ArrowUpRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </NavLink>
    </div>
  );
};
