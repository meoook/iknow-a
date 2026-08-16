import React from 'react';
import { Landmark, AlertTriangle, ShieldCheck } from 'lucide-react';

interface BankBalanceCoverageCardProps {
  bankBalance: number;
  activeBetsAmount: number;
}

export const BankBalanceCoverageCard: React.FC<BankBalanceCoverageCardProps> = ({
  bankBalance,
  activeBetsAmount,
}) => {
  const bankDiff = bankBalance - activeBetsAmount;
  const diffPercent = bankBalance > 0 ? (Math.abs(bankDiff) / bankBalance) * 100 : 0;
  const isHighDiscrepancy = diffPercent > 5;

  return (
    <div
      className={`bg-slate-900/80 border rounded-2xl p-5 glass-panel relative flex flex-col justify-between shadow-xl transition-all ${
        isHighDiscrepancy
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
            className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 transition-colors ${
              isHighDiscrepancy
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
                  -${activeBetsAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
  );
};
