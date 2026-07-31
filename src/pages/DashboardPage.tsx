import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  Wallet,
  Send,
  Clock,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAppSelector } from '../store';

export const DashboardPage: React.FC = () => {
  const requests = useAppSelector((state) => state.predictions.requests);
  const activePredictions = useAppSelector((state) => state.predictions.active);
  const bankInfo = useAppSelector((state) => state.finance.bankInfo);
  const withdrawals = useAppSelector((state) => state.finance.withdrawals);
  const transactions = useAppSelector((state) => state.finance.transactions);

  const totalActiveVolume = activePredictions.reduce((acc, p) => acc + p.volume, 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Панель управления IKNOW <Sparkles className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Обзор метрик платформы, состояния банка, предсказаний и денежных потоков
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Система работает нормально</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Bank Balance */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl glass-panel glass-panel-hover relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Баланс банка
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ${bankInfo.bankTotalBalanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Резерв: {bankInfo.reserveRatio}%</span>
            <NavLink to="/finances/info" className="text-emerald-400 hover:underline flex items-center gap-0.5">
              Инфо <ArrowUpRight className="w-3 h-3" />
            </NavLink>
          </div>
        </div>

        {/* Card 2: Active Predictions Volume */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl glass-panel glass-panel-hover relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Объем предсказаний
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ${totalActiveVolume.toLocaleString('en-US')}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Активных: {activePredictions.length}</span>
            <NavLink to="/predictions/active" className="text-cyan-400 hover:underline flex items-center gap-0.5">
              Смотреть <ArrowUpRight className="w-3 h-3" />
            </NavLink>
          </div>
        </div>

        {/* Card 3: Pending Requests */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl glass-panel glass-panel-hover relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Новые заявки
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 relative">
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
            <NavLink to="/predictions/new" className="text-amber-400 hover:underline flex items-center gap-0.5">
              Модерация <ArrowUpRight className="w-3 h-3" />
            </NavLink>
          </div>
        </div>

        {/* Card 4: Pending Withdrawals */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl glass-panel glass-panel-hover relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ручной вывод
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 relative">
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
            <NavLink to="/finances/withdrawals" className="text-rose-400 hover:underline flex items-center gap-0.5">
              Обработать <ArrowUpRight className="w-3 h-3" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Predictions Preview Table */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 glass-panel">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Топ активных предсказаний</span>
            </h2>
            <NavLink to="/predictions/active" className="text-xs text-cyan-400 hover:underline font-medium">
              Посмотреть все ({activePredictions.length})
            </NavLink>
          </div>

          <div className="space-y-3">
            {activePredictions.slice(0, 3).map((pred) => (
              <div
                key={pred.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={pred.icon}
                    alt="Icon"
                    className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-200 truncate">{pred.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span>Группы: {pred.groups.join(', ')}</span>
                      <span>•</span>
                      <span>Исходов: {pred.choices.length}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold font-mono text-cyan-400">
                    ${pred.volume.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500">Объем ставок</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Financial Activity Log */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 glass-panel">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Последние транзакции</span>
            </h2>
            <NavLink to="/finances/transactions" className="text-xs text-emerald-400 hover:underline font-medium">
              Все
            </NavLink>
          </div>

          <div className="space-y-3">
            {transactions.slice(0, 4).map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        tx.direction === 'IN'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {tx.direction === 'IN' ? 'Ввод' : 'Вывод'}
                    </span>
                    <span>{tx.user}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">{tx.timestamp}</div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-mono font-bold ${
                      tx.direction === 'IN' ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {tx.direction === 'IN' ? '+' : '-'}${tx.amount.toLocaleString()} {tx.token}
                  </div>
                  <div className="text-[10px] text-slate-400">{tx.chain}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
