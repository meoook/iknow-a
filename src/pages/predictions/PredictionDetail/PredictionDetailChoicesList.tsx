import React from 'react';
import { Award, CheckCircle2, RefreshCw, Ban, RotateCcw } from 'lucide-react';
import { IPredictionItem } from '../../../types';
import { formatIconUrl } from '../../../utils/images';

interface PredictionDetailChoicesListProps {
  prediction: IPredictionItem;
  onChangeChoiceIcon?: (choiceId: number, choiceTitle: string) => void;
  onToggleChoiceActive?: (choiceId: number) => void;
  isTogglingActive?: boolean;
}

export const PredictionDetailChoicesList: React.FC<PredictionDetailChoicesListProps> = ({
  prediction,
  onChangeChoiceIcon,
  onToggleChoiceActive,
  isTogglingActive,
}) => {
  const isArchived = prediction.state === 'ENDED' || prediction.state === 'CANCEL';

  return (
    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel flex flex-col gap-5 font-sans">
      {/* Choices Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Варианты исходов ({prediction.choices?.length || 0})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Список возможных исходов события, их текущие коэффициенты, активность и распределение объема ставок.
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
                !choice.active
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : isWinner
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              {/* Choice Icon & Title & Stats */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div
                  className={`shrink-0 relative group/choice ${onChangeChoiceIcon ? 'cursor-pointer' : ''}`}
                  onClick={() => onChangeChoiceIcon?.(choice.id, choice.title)}
                  title={onChangeChoiceIcon ? 'Выбрать или сгенерировать иконку для исхода' : undefined}
                >
                  <img
                    src={formatIconUrl(choice.icon)}
                    alt={choice.title}
                    className={`w-14 h-14 rounded-xl object-cover border border-slate-700 shadow-md transition-all ${
                      choice.active
                        ? 'group-hover/choice:border-cyan-400 group-hover/choice:scale-105'
                        : 'grayscale'
                    }`}
                  />
                  {onChangeChoiceIcon && choice.active && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeChoiceIcon(choice.id, choice.title);
                      }}
                      className="absolute -bottom-1 -right-1 bg-slate-900 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 p-1 rounded-full shadow-md border border-slate-700 transition-all cursor-pointer hover:scale-110"
                      title="Выбрать или сгенерировать иконку"
                    >
                      <RefreshCw size={11} className="font-bold" />
                    </button>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-bold truncate ${
                        !choice.active ? 'text-slate-400 line-through' : 'text-white'
                      }`}
                    >
                      {choice.title}
                    </span>

                    {!choice.active && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                        <Ban size={10} />
                        Выбыл
                      </span>
                    )}

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

              {/* Action: Toggle Active / Inactive */}
              {!isArchived && onToggleChoiceActive && (
                <div className="shrink-0">
                  {choice.active ? (
                    <button
                      type="button"
                      onClick={() => onToggleChoiceActive(choice.id)}
                      disabled={isTogglingActive}
                      title="Отключить прием ставок на данный исход (исход выбыл/проиграл)"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Ban size={13} />
                      <span className="hidden sm:inline">Исключить</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleChoiceActive(choice.id)}
                      disabled={isTogglingActive}
                      title="Возобновить прием ставок на данный исход"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw size={13} />
                      <span className="hidden sm:inline">Вернуть</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
};
