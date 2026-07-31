import React, { useState } from 'react';
import { Archive, Search, ArrowUpDown, Trophy } from 'lucide-react';
import { useAppSelector } from '../../store';

export const ArchivePredictionsPage: React.FC = () => {
  const archivePredictions = useAppSelector((state) => state.predictions.archive);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'volume'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredArchive = archivePredictions
    .filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    .sort((a, b) => {
      if (sortBy === 'volume') {
        return sortOrder === 'desc' ? b.volume - a.volume : a.volume - b.volume;
      } else {
        const dateA = new Date(a.closed || a.endDate).getTime();
        const dateB = new Date(b.closed || b.endDate).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 glass-panel">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Archive className="w-6 h-6 text-slate-400" />
            <span>Архив предсказаний</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Завершенные предсказания с рассчитанными результатами и история выплат.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по архиву..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Сортировка:</span>

          <button
            onClick={() => {
              if (sortBy === 'volume') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              } else {
                setSortBy('volume');
                setSortOrder('desc');
              }
            }}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-semibold transition-all ${
              sortBy === 'volume'
                ? 'bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span>По объему</span>
            <ArrowUpDown size={12} />
          </button>

          <button
            onClick={() => {
              if (sortBy === 'date') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              } else {
                setSortBy('date');
                setSortOrder('desc');
              }
            }}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-semibold transition-all ${
              sortBy === 'date'
                ? 'bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span>По дате</span>
            <ArrowUpDown size={12} />
          </button>
        </div>
      </div>

      {/* Archive Predictions Table */}
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

                      {/* Название (над названием группы предсказаний) */}
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

                      {/* Состояние (ENDED, CANCEL) */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                          {pred.state}
                        </span>
                      </td>

                      {/* Объем */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                        ${pred.volume.toLocaleString()}
                      </td>

                      {/* Даты (создания, закрытия ставок, завершения) */}
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400 space-y-0.5">
                        <div>
                          Создано: <span className="text-slate-300">{pred.created}</span>
                        </div>
                        <div>
                          Ставки до: <span className="text-slate-300">{pred.betDate}</span>
                        </div>
                        <div>
                          Завершено: <span className="text-slate-300">{pred.closed || pred.endDate}</span>
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
    </div>
  );
};
