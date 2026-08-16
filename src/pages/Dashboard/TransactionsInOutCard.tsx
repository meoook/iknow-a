import React from 'react';
import { ArrowDownUp } from 'lucide-react';
import { IFinanceDashboard } from '../../types';

interface TransactionsInOutCardProps {
  txsToday: IFinanceDashboard['txs_today'];
  txsTotal: IFinanceDashboard['txs_total'];
}

export const TransactionsInOutCard: React.FC<TransactionsInOutCardProps> = ({
  txsToday,
  txsTotal,
}) => {
  const totalIn = txsTotal.in_amount;
  const totalOut = txsTotal.out_amount;
  const totalNet = txsTotal.net_amount !== undefined
    ? txsTotal.net_amount
    : totalIn - totalOut;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 glass-panel relative flex flex-col justify-between shadow-xl font-sans">
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
                  ${txsToday.in_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-sm">
                <span className="text-slate-300 font-sans font-medium">Вывод</span>
                <span className="font-bold text-rose-400">
                  ${txsToday.out_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="pt-1 border-t border-slate-800/70 text-sm text-slate-500 font-mono flex items-center justify-between">
              <span>{txsToday.in_count} ввод.</span>
              <span>{txsToday.out_count} вывод.</span>
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
  );
};
