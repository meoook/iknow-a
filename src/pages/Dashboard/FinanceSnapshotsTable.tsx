import React from 'react';
import { History, Calendar } from 'lucide-react';
import { IFinanceSnapshot } from '../../types';

interface FinanceSnapshotsTableProps {
  snapshots?: IFinanceSnapshot[];
}

export const FinanceSnapshotsTable: React.FC<FinanceSnapshotsTableProps> = ({ snapshots = [] }) => {
  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 glass-panel text-center flex flex-col items-center justify-center gap-2 shadow-xl font-sans">
        <History className="w-8 h-8 text-slate-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-300">История снапшотов пока пуста</h3>
        <p className="text-xs text-slate-500">
          Снапшоты формируются автоматически раз в сутки и будут отображаться здесь.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 glass-panel shadow-xl font-sans relative">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
            <History size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Ежедневные финансовые показатели</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Зафиксированная история дохода, депозитов, выводов и ставок платформы по дням
            </p>
          </div>
        </div>
      </div>

      {/* Table with Sticky Header */}
      <div className="relative">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-16 z-10 shadow-sm">
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
              <th className="py-3 px-4 bg-slate-900/95 backdrop-blur-md">Дата</th>
              <th className="py-3 px-4 bg-slate-900/95 backdrop-blur-md text-right">Доход (Fee)</th>
              <th className="py-3 px-4 bg-slate-900/95 backdrop-blur-md text-right">Объем ставок</th>
              <th className="py-3 px-4 bg-slate-900/95 backdrop-blur-md text-right">Ввод средств</th>
              <th className="py-3 px-4 bg-slate-900/95 backdrop-blur-md text-right">Вывод средств</th>
              <th className="py-3 px-4 bg-slate-900/95 backdrop-blur-md text-right">Чистый поток (Net)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {snapshots.map((snap) => {
              const netAmount = snap.in_amount - snap.out_amount;

              return (
                <tr
                  key={snap.id}
                  className="hover:bg-slate-800/30 transition-colors group"
                >
                  {/* Date */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      <span>{snap.created}</span>
                    </div>
                  </td>

                  {/* Fee */}
                  <td className="py-3.5 px-4 text-right font-mono font-black text-cyan-400 text-sm">
                    ${snap.fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Bets Amount & Count */}
                  <td className="py-3.5 px-4 text-right font-mono">
                    <div className="text-blue-400 font-bold">
                      ${snap.bets_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {snap.bets_count} ставок
                    </div>
                  </td>

                  {/* In Amount & Count */}
                  <td className="py-3.5 px-4 text-right font-mono">
                    <div className="text-emerald-400 font-bold">
                      ${snap.in_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {snap.in_count} ввод.
                    </div>
                  </td>

                  {/* Out Amount & Count */}
                  <td className="py-3.5 px-4 text-right font-mono">
                    <div className="text-rose-400 font-bold">
                      ${snap.out_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {snap.out_count} вывод.
                    </div>
                  </td>

                  {/* Net Difference */}
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold">
                    <span className={netAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {netAmount >= 0 ? '+' : '-'}${Math.abs(netAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
