import React from 'react';
import {
  Landmark,
  PiggyBank,
  Users,
  ArrowDownUp,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { IFinanceDashboard } from '../../../types';

interface FinanceKpiCardsProps {
  data: IFinanceDashboard;
}

export const FinanceKpiCards: React.FC<FinanceKpiCardsProps> = ({ data }) => {
  const bankBalance = data.bank_balance;
  const activeBetsAmount = data.active_bets_amount;
  const bankDiff = bankBalance - activeBetsAmount;

  // Check if discrepancy is more than 5% of bank balance
  const diffPercent = bankBalance > 0 ? (Math.abs(bankDiff) / bankBalance) * 100 : 0;
  const isHighDiscrepancy = diffPercent > 5;

  const totalIn = data.external_txs_total.in_amount;
  const totalOut = data.external_txs_total.out_amount;
  const totalNet = data.external_txs_total.net_amount !== undefined
    ? data.external_txs_total.net_amount
    : totalIn - totalOut;

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
                      <span>Баланс банка:</span>
                    </span>
                    <span className="font-bold text-emerald-400">
                      ${bankBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Line 2: Minus Active Bets */}
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-300 flex items-center gap-2 font-sans font-bold">
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                      <span>Сумма ставок:</span>
                    </span>
                    <span className="font-bold text-blue-400">
                      ${activeBetsAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Line 3: Equals Net Difference */}
                <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between font-mono font-bold">
                  <span className="text-slate-200 font-sans flex items-baseline gap-2">
                    <span>Разница:</span>
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
                    ${bankDiff.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                    <span className="text-slate-300 font-sans font-medium">Ввод:</span>
                    <span className="font-bold text-emerald-400">
                      ${data.external_txs_today.in_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-slate-300 font-sans font-medium">Вывод:</span>
                    <span className="font-bold text-rose-400">
                      ${data.external_txs_today.out_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-800/70 text-sm text-slate-500 font-mono flex items-center justify-between">
                  <span>{data.external_txs_today.in_count} ввод.</span>
                  <span>{data.external_txs_today.out_count} вывод.</span>
                </div>
              </div>

              {/* All Time */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-1.5">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
                  За все время
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-slate-300 font-sans font-medium">Ввод:</span>
                    <span className="font-bold text-emerald-400">
                      ${totalIn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-slate-300 font-sans font-medium">Вывод:</span>
                    <span className="font-bold text-rose-400">
                      ${totalOut.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-800/70 flex items-center justify-between text-sm font-mono font-bold">
                  <span className="text-slate-200 font-sans">Разница:</span>
                  <span className={`${totalNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {totalNet >= 0 ? '+' : ''}${totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section: 3 Mini Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mini 1: Средства пользователей */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl glass-panel relative flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Средства пользователей
            </span>
            <div className="text-xl font-extrabold text-purple-300 font-mono mt-1">
              ${data.users_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-xs text-slate-500 font-medium mt-0.5 block">
              Депозиты всех игроков платформы
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Users size={18} />
          </div>
        </div>

        {/* Mini 2: Ставки за сегодня */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl glass-panel relative flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Ставки за сегодня
            </span>
            <div className="text-xl font-extrabold text-blue-400 font-mono mt-1">
              ${data.bets_today.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-xs text-slate-500 font-medium mt-0.5 block">
              {data.bets_today.total_count} ставок оформлено сегодня
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <TrendingUp size={18} />
          </div>
        </div>

        {/* Mini 3: Заработанные средства */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl glass-panel relative flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Заработанные средства
            </span>
            <div className="text-xl font-extrabold text-cyan-400 font-mono mt-1">
              ${data.bank_fee_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-xs text-slate-500 font-medium mt-0.5 block">
              Комиссионный доход
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <PiggyBank size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};
