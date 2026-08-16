import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { IPredictionItem } from '../../../types';
import { formatIconUrl } from '../../../utils/images';

interface PredictionDetailChoicesListProps {
  prediction: IPredictionItem;
}

export const PredictionDetailChoicesList: React.FC<PredictionDetailChoicesListProps> = ({ prediction }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel flex flex-col gap-5">
      {/* Choices Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Варианты исходов ({prediction.choices?.length || 0})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Список возможных исходов события, их текущие коэффициенты и распределение объема ставок.
          </p>
        </div>
      </div>

      {/* 2-Column Choices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prediction.choices?.map((choice, idx) => {
          const isWinner = choice.win === true;
          const isAuthorVote = choice.title === prediction.vote;

          return (
            <div
              key={choice.id || idx}
              className={`border rounded-xl p-4 flex items-center justify-between gap-4 transition-all ${
                isWinner
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              {/* Choice Icon & Title & Stats */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {choice.icon && (
                  <div className="shrink-0">
                    <img
                      src={formatIconUrl(choice.icon)}
                      alt={choice.title}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow-md"
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{choice.title}</span>
                    {isWinner && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 size={10} />
                        Победитель
                      </span>
                    )}
                    {isAuthorVote && (
                      <span className="text-amber-400 font-mono text-[10px] font-bold shrink-0">
                        (Выбор автора)
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 font-mono flex flex-wrap items-center gap-2">
                    <span>
                      Коэффициент: <span className="text-cyan-400 font-bold">{choice.multiplier || 1.0}x</span>
                    </span>
                    <span>•</span>
                    <span>Объём: ${Number(choice.volume || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
