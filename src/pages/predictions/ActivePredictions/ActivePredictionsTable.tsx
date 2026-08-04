import React from 'react';
import { IPredictionItem } from '../../../types';

interface ActivePredictionsTableProps {
  filteredPredictions: IPredictionItem[];
  onOpenModal: (pred: IPredictionItem) => void;
}

export const ActivePredictionsTable: React.FC<ActivePredictionsTableProps> = ({
  filteredPredictions,
  onOpenModal,
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
              <th className="py-3.5 px-4 text-right">Даты (Создано / Ставки / Финал)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredPredictions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Активных предсказаний не найдено
                </td>
              </tr>
            ) : (
              filteredPredictions.map((pred) => (
                <tr
                  key={pred.id}
                  onClick={() => onOpenModal(pred)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  {/* Иконка */}
                  <td className="py-3.5 px-4">
                    <img
                      src={pred.icon}
                      alt="Icon"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700 shadow-sm"
                    />
                  </td>

                  {/* Название */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {pred.groups.map((g, i) => (
                        <span
                          key={i}
                          className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border border-cyan-500/20"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                    <div className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {pred.title}
                    </div>
                  </td>

                  {/* Состояние */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {pred.state}
                    </span>
                  </td>

                  {/* Объем */}
                  <td className="py-3.5 px-4 font-mono font-extrabold text-cyan-400">
                    ${pred.volume.toLocaleString()}
                  </td>

                  {/* Даты */}
                  <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400 space-y-0.5">
                    <div>
                      Создано: <span className="text-slate-300">{pred.created}</span>
                    </div>
                    <div>
                      Ставки до: <span className="text-slate-300">{pred.betDate}</span>
                    </div>
                    <div>
                      Финал: <span className="text-slate-300">{pred.endDate}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
