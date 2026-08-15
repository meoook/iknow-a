import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAppSelector } from '../../store';
import { transactionsSelectors } from '../../store/slices/financeSlice';

export const DashboardRecentTransactions: React.FC = () => {
  const transactions = useAppSelector(transactionsSelectors.selectAll);

  return (
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
        {transactions.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-4">Нет транзакций</div>
        ) : (
          transactions.slice(0, 4).map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${tx.direction === 'IN'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                      }`}
                  >
                    {tx.direction === 'IN' ? 'Ввод' : 'Вывод'}
                  </span>
                  <span>@{tx.user.username}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  {tx.created ? new Date(tx.created).toLocaleString() : '-'}
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`font-mono font-bold ${tx.direction === 'IN' ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                >
                  {tx.direction === 'IN' ? '+' : '-'}${tx.amount.toLocaleString()} {tx.token.currency}
                </div>
                <div className="text-[10px] text-slate-400">{tx.token.chain}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
