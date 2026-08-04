import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAppSelector } from '../../store';

export const DashboardRecentTransactions: React.FC = () => {
  const transactions = useAppSelector((state) => state.finance.transactions);

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
  );
};
