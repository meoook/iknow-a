import React from 'react';
import { Trophy } from 'lucide-react';
import { IPredictionItem } from '../../../types';
import { formatDisplayDate } from '../../../utils/dates';

interface ArchivePredictionsTableProps {
  filteredArchive: IPredictionItem[];
}

export const ArchivePredictionsTable: React.FC<ArchivePredictionsTableProps> = ({
  filteredArchive,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden glass-panel">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-16">Иконка</th>
              <th className="py-3.5 px-4">Название</th>
              <th className="py-3.5 px-4">Состояние</th>
              <th className="py-3.5 px-4">Объем</th>
              <th className="py-3.5 px-4 text-right">Даты (Создано / Ставки / Завершено)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredArchive.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  В архиве пока нет предсказаний
                </td>
              </tr>
            ) : (
              filteredArchive.map((pred) => {
                const winningChoice = pred.choices.find((c) => c.win);
                return (
                  <tr key={pred.id} className="hover:bg-slate-800/40 transition-colors select-text">
                    {/* Иконка */}
                    <td className="py-3.5 px-4">
                      <img
                        src={pred.icon}
                        alt="Icon"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-700 grayscale opacity-80"
                      />
                    </td>

                    {/* Название */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {pred.groups.map((g, i) => (
                          <span
                            key={i}
                            className="bg-slate-800 text-slate-400 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border border-slate-700"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                      <div className="font-bold text-slate-300">
                        {pred.title}
                      </div>
                      {winningChoice && (
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-semibold">
                          <Trophy size={12} />
                          <span>Победитель: {winningChoice.title}</span>
                        </div>
                      )}
                    </td>

                    {/* Состояние */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                        {pred.state}
                      </span>
                    </td>

                    {/* Объем */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                      ${pred.volume.toLocaleString()}
                    </td>

                    {/* Даты */}
                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400 space-y-0.5">
                      <div>
                        Создано: <span className="text-slate-300">{formatDisplayDate(pred.created)}</span>
                      </div>
                      <div>
                        Ставки до: <span className="text-slate-300">{formatDisplayDate(pred.bet_date)}</span>
                      </div>
                      <div>
                        Завершено: <span className="text-slate-300">{formatDisplayDate(pred.closed || pred.end_date)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
