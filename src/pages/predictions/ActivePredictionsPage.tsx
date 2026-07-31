import React, { useState, useRef } from 'react';
import {
  Clock,
  Search,
  ArrowUpDown,
  Trophy,
  CheckCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { resolveActivePrediction } from '../../store/slices/predictionsSlice';
import { IPredictionItem } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';

export const ActivePredictionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const activePredictions = useAppSelector((state) => state.predictions.active);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'volume'>('volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedPrediction, setSelectedPrediction] = useState<IPredictionItem | null>(null);
  const [selectedWinningChoice, setSelectedWinningChoice] = useState<number | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => setSelectedPrediction(null), !!selectedPrediction);

  // Filter & Sort logic
  const filteredPredictions = activePredictions
    .filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    .sort((a, b) => {
      if (sortBy === 'volume') {
        return sortOrder === 'desc' ? b.volume - a.volume : a.volume - b.volume;
      } else {
        const dateA = new Date(a.created).getTime();
        const dateB = new Date(b.created).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
    });

  const handleOpenModal = (pred: IPredictionItem) => {
    setSelectedPrediction(pred);
    setSelectedWinningChoice(pred.choices[0]?.id || null);
  };

  const handleCloseModal = () => {
    setSelectedPrediction(null);
    setSelectedWinningChoice(null);
  };

  const handleConfirmResolve = () => {
    if (selectedPrediction && selectedWinningChoice !== null) {
      dispatch(
        resolveActivePrediction({
          predictionId: selectedPrediction.id,
          winningChoiceId: selectedWinningChoice,
        })
      );
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-6">

      {/* Toolbar: Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск предсказания по названию..."
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
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
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
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>По дате</span>
            <ArrowUpDown size={12} />
          </button>
        </div>
      </div>

      {/* Active Predictions Table */}
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
                    onClick={() => handleOpenModal(pred)}
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

                    {/* Название (над названием группы предсказаний) */}
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

                    {/* Состояние (ACTIVE, END_BET, DISPUTE) */}
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

                    {/* Даты (создания, закрытия ставок, завершения) */}
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

      {/* Resolution Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Trophy size={18} />
                <span>Подведение итогов предсказания</span>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-1">{selectedPrediction.title}</h3>
                <p className="text-xs text-slate-400">{selectedPrediction.rules}</p>
                {selectedPrediction.link && (
                  <a
                    href={selectedPrediction.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 text-xs hover:underline mt-2"
                  >
                    <span>Проверить источник результатов</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Выберите победивший исход (Win Choice):
                </label>
                <div className="space-y-2">
                  {selectedPrediction.choices.map((ch) => (
                    <label
                      key={ch.id}
                      onClick={() => setSelectedWinningChoice(ch.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedWinningChoice === ch.id
                          ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/60'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="winningChoice"
                          checked={selectedWinningChoice === ch.id}
                          onChange={() => setSelectedWinningChoice(ch.id)}
                          className="text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-sm font-bold text-slate-100">{ch.title}</span>
                      </div>
                      <div className="text-right text-xs font-mono">
                        <div className="text-emerald-400 font-bold">x{ch.multiplier}</div>
                        <div className="text-slate-400">${ch.volume.toLocaleString()}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmResolve}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <CheckCircle size={16} />
                <span>Завершить предсказание и выплатить выигрыши</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
