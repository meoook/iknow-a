import React, { useRef } from 'react';
import { Trophy, CheckCircle, X, ExternalLink } from 'lucide-react';
import { IPredictionItem } from '../../../types';
import { useClickOutside } from '../../../hooks/useClickOutside';

interface PredictionResolutionModalProps {
  selectedPrediction: IPredictionItem | null;
  selectedWinningChoice: number | null;
  onSelectChoice: (choiceId: number) => void;
  onClose: () => void;
  onConfirmResolve: () => void;
}

export const PredictionResolutionModal: React.FC<PredictionResolutionModalProps> = ({
  selectedPrediction,
  selectedWinningChoice,
  onSelectChoice,
  onClose,
  onConfirmResolve,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose, !!selectedPrediction);

  if (!selectedPrediction) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Trophy size={18} />
            <span>Подведение итогов предсказания</span>
          </div>
          <button
            onClick={onClose}
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
                  onClick={() => onSelectChoice(ch.id)}
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
                      onChange={() => onSelectChoice(ch.id)}
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
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Отмена
          </button>
          <button
            onClick={onConfirmResolve}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <CheckCircle size={16} />
            <span>Завершить предсказание и выплатить выигрыши</span>
          </button>
        </div>
      </div>
    </div>
  );
};
